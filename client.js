async function requestScreenshot() {
    const url = document.getElementById('urlInput').value;
    const response = await fetch(`/screenshot?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    const img = document.getElementById('screenshotImg');
    img.src = `data:image/png;base64,${data.image}`;
}

document.getElementById('captureBtn').addEventListener('click', requestScreenshot);
