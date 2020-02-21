export const setup = ctx => {
  document.addEventListener("dblclick", e => {
    if (e.repeat) return;

    ctx.play("noise");
  });

  // document.addEventListener("keydown", e => {
  //   if (e.repeat) return;
  //
  //   ctx.play("k_one");
  // });
};
