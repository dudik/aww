var posts = [];

const app = new Vue({
  el: "#app",
  data: {
    posts: []
  },
  created () {
    window.addEventListener('resize', () => {
      this.posts = [];
      resized();
    });
    axios.get('https://www.reddit.com/r/aww+aww_gifs+hardcoreaww/.json?limit=50')
      .then(res => {
        res.data.data.children.forEach(child => {
          if (child.data.domain != 'reddit.com' && child.data.domain != 'v.redd.it') {
            if (!child.data.preview.images[0].variants.mp4) {
              data = child.data.preview.images[0].resolutions[2];
              data.type = 'image';
            } else {
              if (child.data.preview.images[0].variants.mp4.resolutions.length > 2) {
                data = child.data.preview.images[0].variants.mp4.resolutions[2];
              } else {
                data = child.data.preview.images[0].variants.mp4.source;
              }
              data.type = 'video';
            }
            data.url = data.url.replace(/amp;/g, '');
            posts.push(data);
          }
        });
        resized();
      })
      .catch(err => {
        console.log(err);
      });
  }
});

function resized() {
  cw = document.getElementById('app').offsetWidth - 6.1;
  aspRatAll = 0;
  temp = [];
  posts.forEach(post => {
    temp.push(post);
    aspRatAll += post.width / post.height;
    h = cw / aspRatAll;
    if (h < 250) {
      temp.forEach(post => {
        post.nwidth = (h * post.width / post.height) - 6;
        post.nheight = h - 6;
      });
      app.posts = app.posts.concat(temp);
      temp = [];
      aspRatAll = 0;
    }
  });
}
