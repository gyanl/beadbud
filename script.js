document.addEventListener("DOMContentLoaded", function() {
    const j = 16; // Rows
    const k = 16; // Columns

    let activeColor = '';
    let isDragging = false;

    // Create array of 10 color
    const colors = [];
    loadStandardColors();
    loadPastelColors();


    // Function to load standard colors
    function loadStandardColors() {
        colors.push("#02733B");
        colors.push("#226BB2");
        colors.push("#393739");
        colors.push("#56322C");
        colors.push("#8F7CB1");
        colors.push("#D43233");
        colors.push("#D5D9D7");
        colors.push("#E8B737");
        colors.push("#EC6B3A");
        colors.push("#FC5DA2");
    }

    // Function to load pastel colors
    function loadPastelColors() {
        colors.push("#F7E6D3");
        colors.push("#F7D3D3");
        colors.push("#F7D3E6");
        colors.push("#F7D3F7");
        colors.push("#E6D3F7");
        colors.push("#D3D3F7");
        colors.push("#D3E6F7");
        colors.push("#D3F7F7");
        colors.push("#D3F7E6");
        colors.push("#D3F7D3");
    }

    const regular = [
        "#02733B",
        "#226BB2",
        "#393739",
        "#56322C",
        "#8F7CB1",
        "#D43233",
        "#D5D9D7",
        "#E8B737",
        "#EC6B3A",
        "#FC5DA2"
    ];

    const pastel = [
        "#F7E6D3",
        "#F7D3D3",
        "#F7D3E6",
        "#F7D3F7",
        "#E6D3F7",
        "#D3D3F7",
        "#D3E6F7",
        "#D3F7F7",
        "#D3F7E6",
        "#D3F7D3"
    ];

    // Create grid
    const grid = document.getElementById("grid");
    grid.style.gridTemplateRows = `repeat(${j}, 24px)`;
    grid.style.gridTemplateColumns = `repeat(${k}, 24px)`;

    for (let i = 0; i < j * k; i++) {
        let circle = document.createElement("div");
        circle.className = "circle";
        circle.addEventListener("mousedown", function(event) {
            isDragging = true;
            if (activeColor) {
                this.style.backgroundColor = activeColor;
            }
        });
        circle.addEventListener("mouseover", function(event) {
            if (isDragging && activeColor) {
                this.style.backgroundColor = activeColor;
            }
        });
        circle.addEventListener("mouseup", function(event) {
            isDragging = false;
        });
        grid.appendChild(circle);
    }

    // Add mouseup event to the whole document to ensure isDragging is reset
    document.addEventListener("mouseup", function() {
        isDragging = false;
    });

    // Create color palette
    const palette = document.getElementById("palette");
    for (let i = 0; i < colors.length; i++) {
        let color = document.createElement("div");
        color.className = "color";
        color.style.backgroundColor = colors[i];
        color.addEventListener("click", function() {
            activeColor = this.style.backgroundColor;
        });
        palette.appendChild(color);
    }

    document.getElementById('uploadButton').addEventListener('click', function() {
        const imageUploader = document.getElementById('imageUploader');
        if (imageUploader.files && imageUploader.files[0]) {
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                processImage(e.target.result, j, k, colors, (processedCanvas) => {
                    // For demonstration purposes, we will append the processed canvas to the body
                    // You can also handle the canvas in other ways, like converting it to an image for download
                    document.body.appendChild(processedCanvas);
                });
            };
            fileReader.readAsDataURL(imageUploader.files[0]);
        }
    });
    
    function processImage(imageSrc, j, k, palette, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = j;
        canvas.height = k;
    
        const image = new Image();
        image.onload = () => {
            const scaleX = image.width / j;
            const scaleY = image.height / k;
            const scale = Math.max(scaleX, scaleY);
    
            const x = (image.width - scale * j) / 2;
            const y = (image.height - scale * k) / 2;
    
            ctx.drawImage(image, x, y, scale * j, scale * k, 0, 0, j, k);
            const imageData = ctx.getImageData(0, 0, j, k);
            const data = imageData.data;
    
            for (let p = 0; p < k; p++) {
                for (let q = 0; q < j; q++) {
                    const index = (p * j + q) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    const pixelColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                    const closestColor = findClosestColor(pixelColor, palette);
                    updateGridCell(p, q, closestColor);
                }
            }
    
            if (callback) {
                callback(canvas);
            }
        };
    
        image.src = imageSrc;
    }
    

    function updateGridCell(p, q, color) {
        // Assuming grid cells are stored in a flat array for easy access
        const cellIndex = p * j + q;
        const gridCells = document.querySelectorAll('.circle');
        if (gridCells[cellIndex]) {
            gridCells[cellIndex].style.backgroundColor = color;
        }
    }
    
    function findClosestColor(pixelColor, colors) {
        let minDeviation = Infinity;
        let closestColor = '';
    
        colors.forEach((color) => {
            const paletteColor = hexToRgb(color);
            const pixelColorRgb = hexToRgb(pixelColor);
            const deviation = Math.abs(paletteColor.r - pixelColorRgb.r) +
                              Math.abs(paletteColor.g - pixelColorRgb.g) +
                              Math.abs(paletteColor.b - pixelColorRgb.b);
            if (deviation < minDeviation) {
                minDeviation = deviation;
                closestColor = color;
            }
        });
    
        return closestColor;
    }
    
    function hexToRgb(hex) {
        const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return rgb ? {
            r: parseInt(rgb[1], 16),
            g: parseInt(rgb[2], 16),
            b: parseInt(rgb[3], 16)
        } : null;
    }

});
