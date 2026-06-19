// registerPaint('rainbow', class {
//   static get inputProperties() {
//     return ['--rainbow-color-red', '--rainbow-color-green', '--rainbow-color-blue'];
//   }
//   paint(ctx, geom, properties) {
//     const r = parseInt(properties.get('--rainbow-color-red').toString()) || 255;
//     const g = parseInt(properties.get('--rainbow-color-green').toString()) || 0;
//     const b = parseInt(properties.get('--rainbow-color-blue').toString()) || 200;
//     let x = 0;
//     let y = 0;
//     ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
//     ctx.lineWidth = 2;
//     for (let i = 0; i < 200; i++) {
//       x = (geom.width / 200) * i;
//       y = Math.sin(i / 20) * (geom.height * 0.15) + (geom.height * 0.4);
//       ctx.beginPath();
//       ctx.moveTo(x, y);
//       ctx.lineTo(x + 1, y + 1);
//       ctx.stroke();
//     }
//     for (let i = 0; i < 3000; i++) {
//       x = Math.random() * geom.width;
//       y = Math.random() * geom.height;
//       const size = Math.random() * 2;
//       ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.25})`;
//       ctx.fillRect(x, y, size, size);
//     }
//   }
// });


registerPaint('rainbow', class {
  static get inputProperties() {
    return ['--rainbow-color-red', '--rainbow-color-green', '--rainbow-color-blue'];
  }
  paint(ctx, geom, properties) {
    const r = parseInt(properties.get('--rainbow-color-red').toString()) || 255;
    const g = parseInt(properties.get('--rainbow-color-green').toString()) || 0;
    const b = parseInt(properties.get('--rainbow-color-blue').toString()) || 200;
    let x = 0;
    let y = 0;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 200; i++) {
      x = (geom.width / 200) * i;
      y = Math.sin(i / 20) * (geom.height * 0.15) + (geom.height * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 1, y + 1);
      ctx.stroke();
    }
    for (let i = 0; i < 3000; i++) {
      x = Math.random() * geom.width;
      y = Math.random() * geom.height;
      const size = Math.random() * 2;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.25})`;
      ctx.fillRect(x, y, size, size);
    }
  }
});
