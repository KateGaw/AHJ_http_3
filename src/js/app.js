const server = 'https://http-server-3.herokuapp.com';
const images = document.querySelector('.images');
const error = document.getElementById('error-message');
const selectBtn = document.querySelector('#selectBtn');

const drawImages = (img, url) => {
  const newImg = document.createElement('img');
  newImg.className = 'img_el';
  newImg.src = url;

  newImg.addEventListener('load', () => {
    error.classList.add('visibile');
    const newElem = document.createElement('div');
    newElem.className = 'image-element';
    newElem.innerHTML = '<div class="delBtn">✗</div>';
    newElem.appendChild(newImg);
    images.appendChild(newElem);
  });

  newImg.addEventListener('error', () => {
    error.classList.remove('visibile');
  });
};

function loadFile(files) {
  for (const item of files) {
    const formData = new FormData();
    formData.append('file', item);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${server}`);
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const urlImg = `${server}/${xhr.response}`;
        drawImages('nameImg', urlImg);
      }
    });
    xhr.send(formData);
  }
}


const dnd = document.querySelector('#dnd');

// add picture for DnD
const dndAdding = () => {
  dnd.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  dnd.addEventListener('dragleave', (event) => {
    event.preventDefault();
  });

  dnd.addEventListener('drop', (event) => {
    event.preventDefault();
    const pic = Array.from(event.dataTransfer.files);
    loadFile(pic);
  });
};
dndAdding();


// add picture for clicking
dnd.addEventListener('click', () => {
  selectBtn.value = null;
  selectBtn.dispatchEvent(new MouseEvent('click'));
});

// show picture on the page
selectBtn.addEventListener('input', (event) => {
  const pic = Array.from(event.currentTarget.files);
  loadFile(pic);
});

// delete picture
images.addEventListener('click', (event) => {
  if (event.target.className === 'delBtn') {
    const img = event.target.closest('.image-element');
    const params = new URLSearchParams();
    params.append('file', img.querySelector('.img_el').src);

    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `${server}/?${params}`);
    xhr.addEventListener('load', () => {
      console.log(xhr.responseText);
    });
    xhr.send();
    img.parentNode.removeChild(img);
  }
});


async function reloadSavedImages() {
  await fetch(server, {
    method: 'GET',
  }).then(async (response) => {
    const allImages = await response.json();
    for (const img of allImages) {
      if (img !== '.getkeep') {
        drawImages('nameImg', img);
      }
    }
  }).catch((err) => {
    console.error(err);
  });
}
reloadSavedImages();
