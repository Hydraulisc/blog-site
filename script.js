const firebaseConfig = {
    apiKey: "AIzaSyDV4JvWqDdFWJjcH9DGopZxeIeHTtsDTEA",
    authDomain: "hydraul-blog.firebaseapp.com",
    projectId: "hydraul-blog",
    storageBucket: "hydraul-blog.appspot.com",
    messagingSenderId: "18958256761",
    appId: "1:18958256761:web:6d0081cb0a671e62f562a8",
    measurementId: "G-9N109WZ5NJ"
};


firebase.initializeApp(firebaseConfig);
const store = firebase.firestore();
const analytics = firebase.analytics();

// Function to format Firestore Timestamp to readable string
function formatTimestamp(timestamp) {
    // Firestore Timestamp object to JavaScript Date object
    const date = timestamp.toDate();
    return date.toLocaleString();  // Convert to locale string for readable format
}

const loadingPosts = 5;
let lastVisiblePost = null;
let morePostsAvailable = true;

window.onload = function() {
    const entryLocator = new URLSearchParams(window.location.search.slice(1));
    const entryID = entryLocator.get('entry');
    const titleContainer = document.getElementById("title");
    const buttonContainer = document.getElementById("buttons");
    const postContainer = document.getElementById("bodycontainer");
    if(!entryID){
        titleContainer.innerHTML = `<h1 style="color: #5667c7 !important;"><span style="text-decoration: underline !important;">Hydraulisc</span> Developers Digest</h1>`;
        buttonContainer.innerHTML = `<button id="loadMore" class="btn-primary primary-text" disabled>Load More</button>`;
        getPosts();
    } else {
        store.collection("entries").where("path", "==", entryID)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const formattedTimestamp = formatTimestamp(doc.data().update);
                    titleContainer.innerHTML = `<h1>${doc.data().title}</h1>`;  
                    buttonContainer.innerHTML = `<button onclick="location.href='/';" class="btn-primary primary-text">Return Home</button>`;
                    postContainer.innerHTML = `<p style="font-size: 10px; position: absolute; top: 52px; left: 32px;" title="${formattedTimestamp}">${formattedTimestamp}</p>${doc.data().content}`;
            });
        })
    }
}


function getPosts() {
    const postsRef = firebase.firestore().collection('entries');
    let query = postsRef.orderBy('pnum', 'desc').limit(loadingPosts);

    if (lastVisiblePost) {
        query = query.startAfter(lastVisiblePost);
    }

    query.onSnapshot(function(snapshot) {
        // Check if there are more posts available to load
        if (snapshot.size < loadingPosts) {
            morePostsAvailable = false;
document.getElementById("loadMore").disabled = 'true';
        } else {
document.getElementById("loadMore").disabled = 'false';
}
        var posts = snapshot.docs.map(function(post) {
            return post.data();
        });

        posts.forEach(function(post) {
            addPostToPage(post);
        });

        lastVisiblePost = snapshot.docs[snapshot.docs.length - 1];
    });
}

function addPostToPage(post) {
    const formattedTimestamp = formatTimestamp(post.update);
    var postElement = `
    <br>
    <div style="border: 2px solid;" class="carrd ${post.path}">
        <div style="position: relative;">
            <h3 style="cursor: default; position: relative; left: 10px;">${post.title}</h3>
            <p style="font-size: 10px; position: absolute; top: -10px; right: 29px;">${formattedTimestamp}</p>
        </div>
        <button style="width: 100%; border: none; border-radius: 10px 10px 0px 0px; background-color: #5667c7; text-transform: uppercase; cursor: pointer;" class="primary-text" onclick="location.href='/?entry=${post.path}';">read</button>
    </div>
  `;
  document.getElementById("entries").innerHTML += postElement;
};

document.addEventListener('click', (e) => {
    let element = e.target;
    if(morePostsAvailable){
        if(element.id == 'loadMore'){
            getPosts();
        }
    } else {
        return;   
    }

})