<template>
  <div id="app">
    <Home></Home>
  </div>
</template>

<script>
import Home from '@/views/Home'
export default {
  components:{Home},
  mounted() {
    (function () {
      function __canvasWM({
        container = document.body,
        width = "200px",
        height = "150px",
        textAlign = "center",
        textBaseline = "middle",
        font = "18px microsoft yahei",
        fillStyle = "rgba(184, 184, 184, 0.35)",
        content = `by.晨隐_`,
        rotate = "30",
        zIndex = 1,
      } = {}) {
        var canvas = document.createElement("canvas");

        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        var ctx = canvas.getContext("2d");

        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        ctx.font = font;
        ctx.fillStyle = fillStyle;
        ctx.rotate((Math.PI / 180) * rotate);
        ctx.fillText(content, parseFloat(width) / 2, parseFloat(height) / 2);

        var base64Url = canvas.toDataURL();
        const watermarkDiv = document.createElement("div");
        watermarkDiv.setAttribute(
          "style",
          `
          position:fixed;
          top:0;
          left:0;
          right:0;
          bottom:0;
          z-index:${zIndex};
          pointer-events:none;
          background-repeat:repeat;
          background-image:url('${base64Url}')`
        );

        container.style.position = "relative";
        container.insertBefore(watermarkDiv, container.firstChild);
      }
      window.__canvasWM = __canvasWM;
    })();
    window.__canvasWM()
  },
};
</script>
<style>
* {
  margin: 0;
  padding: 0;
}
</style>
