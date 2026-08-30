const releaseEndpoint = "https://api.github.com/repos/kenn-io/docbank/releases/latest";
const releasesPage = "https://github.com/kenn-io/docbank/releases/latest";

function installLightboxes() {
  const dialog = document.querySelector("[data-lightbox-dialog]");
  if (!(dialog instanceof HTMLDialogElement)) return;

  const image = dialog.querySelector("img");
  const title = dialog.querySelector("[data-lightbox-title]");
  const close = dialog.querySelector("[data-lightbox-close]");
  let trigger = null;

  for (const link of document.querySelectorAll("a[data-lightbox]")) {
    link.addEventListener("click", (event) => {
      if (!(image instanceof HTMLImageElement)) return;
      event.preventDefault();
      trigger = link;
      const source = link.getAttribute("href");
      const preview = link.querySelector("img");
      if (!source || !(preview instanceof HTMLImageElement)) return;
      image.src = source;
      image.alt = preview.alt;
      if (title) title.textContent = preview.alt;
      dialog.showModal();
      if (close instanceof HTMLElement) close.focus();
    });
  }

  close?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (image instanceof HTMLImageElement) image.removeAttribute("src");
    if (trigger instanceof HTMLElement) trigger.focus();
  });
}

function platformPattern(value) {
  const [operatingSystem, architecture] = value.split("-");
  const extension = operatingSystem === "windows" ? "zip" : "tar.gz";
  return new RegExp(`_${operatingSystem}_${architecture}\\.${extension.replace(".", "\\.")}$`);
}

function installReleaseDownload() {
  const form = document.querySelector("[data-release-download]");
  if (!(form instanceof HTMLFormElement)) return;
  const select = form.querySelector("select");
  const status = form.querySelector("[data-release-status]");
  const submit = form.querySelector("button[type='submit']");
  if (!(select instanceof HTMLSelectElement) || !(status instanceof HTMLElement)) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit instanceof HTMLButtonElement) submit.disabled = true;
    status.textContent = "Checking the latest release…";

    try {
      const response = await fetch(releaseEndpoint, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!response.ok) throw new Error(`release request returned ${response.status}`);
      const release = await response.json();
      const asset = release.assets?.find(({ name }) => platformPattern(select.value).test(name));
      if (!asset?.browser_download_url) throw new Error("release has no matching archive");

      const link = document.createElement("a");
      link.href = asset.browser_download_url;
      link.textContent = `Download ${asset.name}`;
      status.replaceChildren(link);
    } catch {
      const link = document.createElement("a");
      link.href = releasesPage;
      link.textContent = "Open all releases";
      status.replaceChildren("The latest archive could not be resolved. ", link);
    } finally {
      if (submit instanceof HTMLButtonElement) submit.disabled = false;
    }
  });
}

installLightboxes();
installReleaseDownload();
