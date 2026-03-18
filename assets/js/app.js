const cl = console.log;

const postForm = document.getElementById('postForm')
const titleControl = document.getElementById('title')
const contentControl = document.getElementById('content')
const userIdControl = document.getElementById('userId')
const spinner = document.getElementById('spinner')
const addPostBtn = document.getElementById('addPostBtn')
const updatePostBtn = document.getElementById('updatePostBtn')

// create >> POST
// get from DB >> GET
// remove >> DELETE
// update >> PUT/PATCH

const BASE_URL = `https://crud-14628-default-rtdb.firebaseio.com`

const POSTS_URL = `${BASE_URL}/posts.json`;
const postContainer = document.getElementById('postContainer')

let postsArr = []

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}


const createPostCards = arr => {
    postsArr = arr;
    let result = '';
    for (let i = arr.length - 1; i >= 0; i--) {
        result += `
            <div class="col-md-4 mb-4" id="${arr[i].id}">
                <div class="card h-100">
                    <div class="card-header">
                        <h3>
                            ${arr[i].title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${arr[i].content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button 
                        onclick="onEdit(this)"
                        class="btn btn-sm btn-outline-primary">Edit</button>
                        <button 
                        onclick="onRemove(this)"
                        class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>
            </div>`

    };

    postContainer.innerHTML = result;

}

function fetchPosts() {
    spinner.classList.remove('d-none')
    fetch(POSTS_URL, {
        method: "GET",
        body: null,
        headers: {
            "auth": "Token from Local Storage"
        }
    })
        .then(res => {
            if (res.ok) {
                return res.json()
            }
        })
        .then(data => {
            for (const key in data) {
                postsArr.push({ ...data[key], id: key })
                cl(postsArr)
                createPostCards(postsArr)
            }
        })
        .catch(err => {
            cl(err)
        })
        .finally(() => {
            spinner.classList.add('d-none')
        })
}

fetchPosts()

function onPostSubmit(eve) {
    eve.preventDefault();

    let newPost = {
        title: titleControl.value,
        content: contentControl.value,
        userId: userIdControl.value

    }

    // Spinner Show

    spinner.classList.remove('d-none')
    fetch(POSTS_URL, {
        method: "POST",
        body: JSON.stringify(newPost),
        headers: {
            auth: "Token from Local Storage"
        }
    })
        .then(res => {
            if (res.ok) {
                return res.json()
            }
        })
        .then(data => {
            postForm.reset()
            cl(data) // {name : "hsdudshisdj"}
            // A new Card should be created in UI
            let col = document.createElement('div')
            col.className = 'col-md-4 mb-4';
            col.id = data.name;
            col.innerHTML = `  
                <div class="card h-100">
                    <div class="card-header">
                        <h3>
                            ${newPost.title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${newPost.content}
                  
                            </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button 
                        onclick="onEdit(this)"
                        class="btn btn-sm btn-outline-primary">Edit</button>
                        <button 
                        onclick="onRemove(this)"
                        class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>`

            postContainer.prepend(col)
            snackbar(`The Post with ID ${data.name} is added successfully!!!`, 'success')


        })
        .catch(err => {
            snackbar(err)
        })
        .finally(() => {
            spinner.classList.add('d-none')
        })
}

function onEdit(ele) {
    let EDIT_ID = ele.closest('.col-md-4').id
    localStorage.setItem('EDIT_ID', EDIT_ID);

    let EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}.json`
    // Spinner Show
    spinner.classList.remove('d-none')

    fetch(EDIT_URL, {
        method: "GET",
        body: null,
        headers: {
            auth: "Token from Local Storage"
        }
    })
        .then(res => {
            if (res.ok) {
                return res.json()
            }
        })
        .then(data => {
            cl(data)
            // Patch data in Form-controls
            titleControl.value = data.title;
            contentControl.value = data.content;
            userIdControl.value = data.userId;
            addPostBtn.classList.add('d-none');
            updatePostBtn.classList.remove('d-none');
            snackbar(`The Post with ID ${EDIT_ID} is patched successfully!!!`, 'success')

        })
        .catch(err => {
            snackbar(err)
        })
        .finally(() => {
            spinner.classList.add('d-none')
        })
}


function onPostUpdate() {

    // UPDATE_ID

    let UPDATE_ID = localStorage.getItem('EDIT_ID')

    // UPDATED_OBJ

    let UPDATED_OBJ = {
        title: titleControl.value,
        content: contentControl.value,
        userId: userIdControl.value,
        id: UPDATE_ID
    }

    // UPDATE_URL

    let UPDATE_URL = `${BASE_URL}/posts/${UPDATE_ID}.json`

    // API CALL
    // Spinner Show
    spinner.classList.remove('d-none')
    fetch(UPDATE_URL, {
        method: "PATCH",
        body: JSON.stringify(UPDATED_OBJ),
        headers: {
            auth: "Token from Local Storage"
        }
    })
        .then(res => {
            if (res.ok) {
                return res.json()
            }
        })
        .then(data => {
            cl(data)
            postForm.reset()
            let col = document.getElementById(UPDATE_ID);
            col.querySelector('.card-header h3').innerHTML = UPDATED_OBJ.title;
            col.querySelector('.card-body p').innerHTML = UPDATED_OBJ.content;
            addPostBtn.classList.remove('d-none')
            updatePostBtn.classList.add('d-none')
            snackbar(`The Post with ID ${UPDATE_ID} is updated successfully!!!`, 'success')
        })
        .catch(err => {
            snackbar(err)
        })
        .finally(() => {
            spinner.classList.add('d-none')
        })
}

function onRemove(ele) {
    let REMOVE_ID = ele.closest('.col-md-4').id
    Swal.fire({
        title: `Do you want to remove the post with id ${REMOVE_ID}?`,
        showCancelButton: true,
        confirmButtonText: "Remove",
    }).then((result) => {
        if (result.isConfirmed) {
            spinner.classList.remove('d-none')

            let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}.json`
            fetch(REMOVE_URL, {
                method: "DELETE",
                body: null,
                headers: {
                    "auth": "Token from Local Storage"
                }
            })
                .then(res => {
                    if (res.ok) {
                        return res.json()
                    }
                })
                .then(data => {
                    cl(data)
                    ele.closest('.col-md-4').remove()
                    snackbar(`The post with id ${REMOVE_ID} is removed successfully!!!`, 'success')
                })
                .catch(err => {
                    snackbar(err)
                })
                .finally(() => {
                    spinner.classList.add('d-none')
                })
        }
    });

}




postForm.addEventListener('submit', onPostSubmit)
updatePostBtn.addEventListener('click', onPostUpdate)
