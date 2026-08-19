/**
 * Gallery lightbox.
 *
 * Built on the native <dialog> element, which supplies the focus trap, the
 * backdrop, inert-ing the rest of the page and Esc-to-close for free. The one
 * thing it does not do is restore focus to the trigger, so we do that here.
 */
export function initLightbox(root = document) {
  const dialog = root.querySelector("#lightbox");
  const image = root.querySelector("#lightbox-img");
  const caption = root.querySelector("#lightbox-caption");
  const triggers = Array.from(root.querySelectorAll(".gallery__item"));

  if (!dialog || !image || triggers.length === 0) return;
  if (typeof dialog.showModal !== "function") return; // no <dialog>: grid still works

  let index = 0;

  function show(next) {
    index = (next + triggers.length) % triggers.length;
    const trigger = triggers[index];
    const inner = trigger.querySelector("img");
    image.src = trigger.dataset.full || (inner ? inner.src : "");
    image.alt = inner ? inner.alt : "";
    caption.textContent = trigger.dataset.caption || "";
  }

  triggers.forEach((trigger, position) => {
    trigger.addEventListener("click", () => {
      show(position);
      dialog.showModal();
    });
  });

  dialog.addEventListener("click", (event) => {
    const action = event.target.dataset.lb;
    if (action === "close") dialog.close();
    else if (action === "next") show(index + 1);
    else if (action === "prev") show(index - 1);
    else if (event.target === dialog) dialog.close(); // click the backdrop
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); show(index + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
  });

  // Return focus to the thumbnail that opened the viewer.
  dialog.addEventListener("close", () => triggers[index].focus());
}
