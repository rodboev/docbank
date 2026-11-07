#!/usr/bin/env python3
"""One-off native API comparison. Run only against the pinned disposable checkout."""

import datetime
import hashlib
import json
import os
from pathlib import Path
import platform
import signal
import subprocess
import sys
import tempfile
import time

BASE = "bde2c1b07e9245c06feebd86bb0766287afb7061"
PACKAGE = "go.kenn.io/docbank/internal/api"


def patch_candidate(source):
    replacements = {
        "internal/api/main_test.go": [
            ('"go.kenn.io/docbank/internal/packagetest"',
             '"go.kenn.io/docbank/internal/packagetest"\n\t"go.kenn.io/docbank/internal/sqlitetest"'),
            ("func TestMain(m *testing.M) {\n",
             "func TestMain(m *testing.M) {\n\tsqlitetest.DisableSync.Store(true)\n"),
        ],
        "internal/blob/blob.go": [
            ('\t"go.kenn.io/kit/backup"',
             '\t"go.kenn.io/docbank/internal/sqlitetest"\n\n\t"go.kenn.io/kit/backup"'),
            ("\t\tCompression: s.compression,\n\t}\n",
             "\t\tCompression: s.compression,\n\t}\n"
             "\tif sqlitetest.DisableSync.Load() {\n"
             "\t\topts.Durability = packstore.AtomicPublication\n\t}\n"),
        ],
    }
    originals = {}
    patched = {}
    for name, pairs in replacements.items():
        path = source / name
        originals[path] = path.read_bytes()
        text = originals[path].decode()
        for old, new in pairs:
            if text.count(old) != 1:
                raise RuntimeError(f"Expected exactly one patch match in {name}: {old!r}")
            text = text.replace(old, new, 1)
        patched[path] = text
    for path, text in patched.items():
        path.write_text(text)
    return originals


def main():
    source, results = (Path(arg).resolve() for arg in sys.argv[1:])
    results.mkdir(parents=True, exist_ok=False)
    env = os.environ.copy()
    # Keep compiler scratch and binaries on disk, including during the RAM arm.
    disk = Path(env["RUNNER_TEMP"]).resolve()
    env["GOTMPDIR"] = str(disk)
    env["TMPDIR"] = str(disk)
    env["GOFLAGS"] = "-trimpath"
    env["CGO_ENABLED"] = "1"

    def capture(args):
        return subprocess.check_output(args, cwd=source, env=env, text=True)

    if capture(["git", "rev-parse", "HEAD"]).strip() != BASE:
        raise RuntimeError("Source checkout differs from fixed base")
    if capture(["git", "status", "--porcelain"]):
        raise RuntimeError("Source checkout must be clean")
    (results / "environment.txt").write_text(
        f"source={BASE}\nplatform={platform.platform()}\n"
        + f"build_TMPDIR={env['TMPDIR']}\nbuild_GOTMPDIR={env['GOTMPDIR']}\n"
        + capture(["go", "version"])
        + capture(["go", "env", "-json", "GOOS", "GOARCH", "CGO_ENABLED", "GOFLAGS", "GOTMPDIR", "GOCACHE"])
    )
    (results / "native-package.json").write_text(capture(["go", "list", "-json", "-tags", "fts5", "./internal/api"]))
    converter = capture(["go", "tool", "-n", "test2json"]).strip()
    device = None
    failed = False
    with tempfile.TemporaryDirectory(prefix="api-isolated-", dir=disk) as scratch:
        binaries = {arm: str(Path(scratch) / f"api-{arm}.test") for arm in ("A", "C")}

        def build(arm):
            with (results / f"build-{arm}.log").open("w") as log:
                subprocess.run(["go", "test", "-c", "-tags", "fts5", "-o", binaries[arm], "./internal/api"],
                               cwd=source, env=env, stdout=log, stderr=subprocess.STDOUT, check=True)
            (results / f"binary-{arm}.sha256").write_text(hashlib.sha256(Path(binaries[arm]).read_bytes()).hexdigest() + "\n")

        build("A")
        originals = patch_candidate(source)
        try:
            (results / "candidate.patch").write_text(capture(["git", "diff", "--", "internal/api/main_test.go", "internal/blob/blob.go"]))
            build("C")
        finally:
            for path, content in originals.items():
                path.write_bytes(content)
        if capture(["git", "status", "--porcelain"]):
            raise RuntimeError("Source restoration failed")

        # The same native test set runs from its original package directory.
        cwd = source / "internal/api"
        for arm, binary in binaries.items():
            listing = subprocess.check_output([binary, "-test.list=."], cwd=cwd, env=env, text=True)
            (results / f"tests-{arm}.txt").write_text(listing)
        if (results / "tests-A.txt").read_bytes() != (results / "tests-C.txt").read_bytes():
            raise RuntimeError("Candidate changed the native test set")

        order = "ABCABC" if platform.system() == "Darwin" else "AC"
        try:
            ram = None
            if "B" in order:
                device = subprocess.check_output(["hdiutil", "attach", "-nomount", "ram://4194304"], text=True).strip()
                subprocess.run(["diskutil", "eraseVolume", "APFS", "docbank-test", device], check=True)
                ram = Path(tempfile.mkdtemp(prefix="tmp.", dir="/Volumes/docbank-test")).resolve()

            def snapshot(label, phase):
                with (results / f"{label}-{phase}.txt").open("w") as log:
                    log.write(datetime.datetime.now(datetime.timezone.utc).isoformat() + "\n")
                    log.flush()
                    subprocess.run(["df", "-k", str(ram if ram else disk)], env=env,
                                   stdout=log, stderr=subprocess.STDOUT, check=True)
                    if platform.system() == "Darwin":
                        subprocess.run(["vm_stat"], env=env, stdout=log, stderr=subprocess.STDOUT, check=True)

            with (results / "arms.jsonl").open("w", buffering=1) as summary:
                for index, arm in enumerate(order, 1):
                    label = f"{index:02d}-{arm}"
                    # Go 1.27 testing.T.TempDir uses GOTMPDIR; os.TempDir uses TMPDIR.
                    directory = str(ram if arm == "B" else disk)
                    arm_env = env | {"GOTMPDIR": directory, "TMPDIR": directory}
                    (results / f"{label}-environment.json").write_text(json.dumps(
                        {name: str(Path(arm_env[name]).resolve(strict=True)) for name in ("GOTMPDIR", "TMPDIR")},
                        indent=2) + "\n")
                    binary = binaries["A" if arm == "B" else arm]
                    command = [converter, "-t", "-p", PACKAGE, binary, "-test.v=test2json", "-test.count=1", "-test.timeout=30m"]
                    snapshot(label, "before")
                    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
                    before = time.monotonic()
                    timed_out = False
                    with (results / f"{label}.json").open("w") as output, (results / f"{label}.stderr").open("w") as errors:
                        process = subprocess.Popen(command, cwd=cwd, env=arm_env, stdout=output, stderr=errors, start_new_session=True)
                        try:
                            code = process.wait(timeout=1800)
                        except subprocess.TimeoutExpired:
                            timed_out = True
                            os.killpg(process.pid, signal.SIGTERM)
                            try:
                                process.wait(timeout=5)
                            except subprocess.TimeoutExpired:
                                os.killpg(process.pid, signal.SIGKILL)
                                process.wait(timeout=5)
                            code = 124
                    wall = time.monotonic() - before
                    snapshot(label, "after")
                    events = [json.loads(line) for line in (results / f"{label}.json").read_text().splitlines()]
                    terminal = [event for event in events if event.get("Test") and "/" not in event["Test"] and event["Action"] in ("pass", "fail", "skip")]
                    record = dict(arm=arm, index=index, started=started, wall_seconds=wall, exit_code=code,
                                  timed_out=timed_out, top_level_seconds=sum(event.get("Elapsed", 0) for event in terminal),
                                  top_level_counts={action: sum(event["Action"] == action for event in terminal) for action in ("pass", "fail", "skip")})
                    summary.write(json.dumps(record) + "\n")
                    print(json.dumps(record), flush=True)
                    failed |= code != 0
        finally:
            if device:
                subprocess.run(["hdiutil", "detach", device], check=True)
    return int(failed)


if __name__ == "__main__":
    sys.exit(main())
