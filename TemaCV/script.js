//Toggle Info Button
console.log("Script loaded");

var p=document.getElementById("info");

function show(){
    console.log("Button clicked");
    p.classList.toggle('hideText');
}

document.getElementById('toggleButton').addEventListener('click',show);

//Color Change Buttons
const button1 = document.getElementById('green');
const button2 = document.getElementById('white');
const button3 = document.getElementById('blue');

const rightSection = document.getElementById('rightSection');

button1.addEventListener('click', function() {
    rightSection.style.backgroundColor = '#409e44'; 
});

button2.addEventListener('click', function() {
    rightSection.style.backgroundColor = '#fff';
});

button3.addEventListener('click', function() {
    rightSection.style.backgroundColor = '#00ffff'
});

//Change font size
const fontSizeSelect = document.getElementById('fontSizeSelect');

fontSizeSelect.addEventListener('change', function() {
    const selectedFontSize = fontSizeSelect.value;
    const paragraphs = document.querySelectorAll('.right-section p');

    
    paragraphs.forEach(paragraph => {
        switch (selectedFontSize) {
            case 'small':
                paragraph.style.fontSize = '12px'; 
                break;
            case 'medium':
                paragraph.style.fontSize = '16px'; 
                break;
            case 'large':
                paragraph.style.fontSize = '20px'; 
                break;
            default:
                break;
        }
    });
});
