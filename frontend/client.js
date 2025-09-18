const canvas = document.getElementById('screen');




// Navigate
document.getElementById('navigateBtn').addEventListener('click', () => {
    const url = document.getElementById('urlInput').value;
    if (!url) return;
    fetch('/api/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    }).then(res => res.json())
      .then(data => {
          const img = new Image();
          img.src = 'data:image/png;base64,' + data.image;
          img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      });
});
