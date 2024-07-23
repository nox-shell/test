// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAK-dzBJ9sIwgQJ7iR0Kh_MvOLy7i-F3O0",
    authDomain: "blog-ad58e.firebaseapp.com",
    databaseURL: "https://blog-ad58e-default-rtdb.firebaseio.com",
    projectId: "blog-ad58e",
    storageBucket: "blog-ad58e.appspot.com",
    messagingSenderId: "921348005047",
    appId: "1:921348005047:web:2d9797dae380482aa40132",
    measurementId: "G-WRESM9JHSG"
};
firebase.initializeApp(firebaseConfig);

function showLoadingModal() {
    document.getElementById('loading-modal').style.display = 'flex';
}

function hideLoadingModal() {
    document.getElementById('loading-modal').style.display = 'none';
}

function showSuccessModal() {
    document.getElementById('success-modal').style.display = 'flex';
}

function closeSuccessModal() {
    document.getElementById('success-modal').style.display = 'none';
}

function upload() {
    showLoadingModal();
    var title = document.getElementById('title').value;
    var amount = document.getElementById('amount').value;
    var details = document.getElementById('details').value;
    var phone = document.getElementById('phone').value;
    var post = document.getElementById('post').value;

    var images = [
        document.getElementById('image1').files[0],
        document.getElementById('image2').files[0],
        document.getElementById('image3').files[0],
        document.getElementById('image4').files[0],
        document.getElementById('image5').files[0]
    ];

    var uploadPromises = images.map((image, index) => {
        if (image) {
            var storageRef = firebase.storage().ref('images/' + image.name);
            return storageRef.put(image).then(snapshot => {
                return snapshot.ref.getDownloadURL();
            });
        } else {
            return Promise.resolve(null);
        }
    });

    Promise.all(uploadPromises).then(imageURLs => {
        firebase.database().ref('blogs/').push().set({
            title: title,
            amount: amount,
            details: details,
            phone: phone,
            text: post,
            imageURLs: imageURLs.filter(url => url !== null)
        }, function(error) {
            hideLoadingModal();
            if (error) {
                alert("Error while uploading");
            } else {
                document.getElementById('post-form').reset();
                getdata();
                showSuccessModal();
            }
        });
    }).catch(error => {
        console.log(error.message);
        hideLoadingModal();
    });
}

function getdata() {
    firebase.database().ref('blogs/').once('value').then(function(snapshot) {
        const posts_div = document.getElementById('posts');
        posts_div.innerHTML = "";
        const data = snapshot.val();
        for (let [key, value] of Object.entries(data)) {
            posts_div.innerHTML += `
                <div class='col-sm-4 mt-2 mb-1'>
                    <div class='card'>
                        <img src='${value.imageURLs}' style='height:250px;'>
                        <div class='card-body'>
                            <h5 class='card-title'>${value.title}</h5>
                            <p class='card-text'>Amount: ${value.amount}</p>
                            <button class='btn btn-info' onclick='viewDetails("${key}")'>View Details</button>
                            <button class='btn btn-danger' id='${key}' onclick='delete_post(this.id)'>Delete</button>
                        </div>
                    </div>
                </div>`;
        }
    });
}

function viewDetails(key) {
    window.location.href = `details.html?key=${key}`;
}

function delete_post(key) {
    firebase.database().ref('blogs/' + key).remove();
    getdata();
}

window.onload = function() {
    getdata();
}

/*config */
function previewImages() {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    const files = [
        document.getElementById('image1').files[0],
        document.getElementById('image2').files[0],
        document.getElementById('image3').files[0],
        document.getElementById('image4').files[0],
        document.getElementById('image5').files[0]
    ];
    files.forEach(file => {
        if (file) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        }
    });
}

function upload() {
    // Show loading dialog
    document.getElementById('loading-dialog').classList.add('active');

    // Get your images
    var images = [
        document.getElementById('image1').files[0],
        document.getElementById('image2').files[0],
        document.getElementById('image3').files[0],
        document.getElementById('image4').files[0],
        document.getElementById('image5').files[0]
    ];

    // Get your blog text fields
    var title = document.getElementById('title').value;
    var amount = document.getElementById('amount').value;
    var details = document.getElementById('details').value;
    var phone = document.getElementById('phone').value;

    // Firebase storage references
    var storageRefs = images.map((image, index) => image ? firebase.storage().ref('images/' + image.name) : null);
    
    // Upload images to Firebase storage
    var uploadTasks = storageRefs.map((storageRef, index) => storageRef ? storageRef.put(images[index]) : null);

    // Handle all upload tasks
    Promise.all(uploadTasks.filter(task => task !== null)).then((snapshots) => {
        return Promise.all(snapshots.map(snapshot => snapshot.ref.getDownloadURL()));
    }).then((downloadURLs) => {
        // Store post in Firebase database
        firebase.database().ref('blogs/').push().set({
            title: title,
            amount: amount,
            details: details,
            phone: phone,
            imageURLs: downloadURLs
        }, function(error) {
            // Hide loading dialog and show success dialog
            document.getElementById('loading-dialog').classList.remove('active');
            if (error) {
                alert("Error while uploading");
            } else {
                document.getElementById('success-dialog').classList.add('active');
                // Reset your form
                document.getElementById('post-form').reset();
                previewImages();
                getdata();
            }
        });
    }).catch((error) => {
        // Handle error
        document.getElementById('loading-dialog').classList.remove('active');
        console.log(error.message);
    });
}

function closeSuccessDialog() {
    document.getElementById('success-dialog').classList.remove('active');
}

function getdata() {
    firebase.database().ref('blogs/').once('value').then(function(snapshot) {
        var posts_div = document.getElementById('posts');
        posts_div.innerHTML = "";
        var data = snapshot.val();
        for (let [key, value] of Object.entries(data)) {
            posts_div.innerHTML += "<div class='col-md-4 mt-2 mb-1'>" +
                "<div class='card'>" +
                "<img src='" + value.imageURLs[0] + "' class='card-img-top' style='height:250px;'>" +
                "<div class='card-body'>" +
                "<h5 class='card-title'>" + value.title + "</h5>" +
                "<p class='card-text'>" + value.amount + "</p>" +
                "<a class='btn btn-primary mr-2 ' href='/details/details.html?key=" + key + "'>See More <i class='ri-shopping-cart-line'></i></a> " +
                "<button class='btn btn-danger  ' id='" + key + "' onclick='delete_post(this.id)'>Delete <i class='ri-delete-bin-line'></i></button>" +
                "</div></div></div>";
        }
    });
}

function viewPost(key) {
    firebase.database().ref('blogs/' + key).once('value').then(function(snapshot) {
        var value = snapshot.val();
        var images = value.imageURLs.map(url => `<img src="${url}" style="width:100px; height:100px; margin:5px;">`).join('');
        var details = `<div class="card">
            <img src="${value.imageURLs[0]}" class="card-img-top" style="height:250px;">
            <div class="card-body">
                <h5 class="card-title">${value.title}</h5>
                <p class="card-text">${value.amount}</p>
                <p class="card-text">${value.details}</p>
                <p class="card-text">${value.phone}</p>
                <div>${images}</div>
            </div>
        </div>`;
        var modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'post-modal';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'exampleModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `<div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Post Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${details}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>`;
        document.body.appendChild(modal);
        var modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    });
}

function delete_post(key) {
    firebase.database().ref('blogs/' + key).remove();
    getdata();
}

// Initial data load
getdata();
