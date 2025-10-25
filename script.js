const entriesLocator = document.getElementById("entries");

async function populatePosts() {
    try {
        const response = await fetch(`http://127.0.0.1:5500/blog/index.json`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if(!response.ok) {
            throw new Error('HTTP Error! Status: ' + response.status);
        }
        return await response.json();
    } catch(error) {
        console.log(error);
        return null;
    }
}

populatePosts().then(data => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        entriesLocator.innerHTML = '<p>No posts found.</p>';
        return;
    }

    // Sort newest first (hopefully ISO date-friendly)
    const bogoSort = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    entriesLocator.innerHTML = bogoSort.map(post => {
        const title = escapeHtml(post.title || post.id || 'Untitled');
        const url = post.url || ('/blog/' + encodeURIComponent(post.id || ''));
        return `
        <br>
        <a href="${url}.html">
            <div class="carrd primary-text">
                <div style="position: relative;">
                    <p style="font-size: 10px; position: absolute; top: -20px; right: 12px;">${post.date}</p>
                    <h3>${title}</h3>
                </div>
                <button class="primary-text">read</button>
            </div>
        </a>
        `;
    }).join('\n');

})

// small helper to avoid XSS when inserting strings
function escapeHtml(str) {
return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}