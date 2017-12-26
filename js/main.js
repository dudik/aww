var allPosts = [];
var after = '';
var loading;

var app = new Vue({
  el: "#app",
  data: {
    posts: [],
    active: -1
  },
  watch: {
    active: function(active) {
      if (active != -1) {
        document.body.style.overflowY = 'hidden';
      } else {
        document.body.style.overflowY = 'auto';
      }
    }
  },
  created () {
    sw = screen.width;
    sh = screen.height;
    window.addEventListener('resize', () => {
      this.posts = [];
      resized();
    });
    window.addEventListener('keypress', (e) => {
      keyCode = e.keyCode;
      if (this.active != -1) {
        if (keyCode == 39 && this.active != this.posts.length - 1) {
          this.active++;
        } else if (keyCode == 37) {
          this.active--;
        } else if (keyCode == 27) {
          this.active = -1;
        }
      }
    });
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY == document.body.offsetHeight && !loading) {
        load();
      }
    });
    load();
  }
});

function load() {
  loading = true;
  axios.get('https://www.reddit.com/r/aww+aww_gifs+hardcoreaww/.json?limit=50&after=' + after) // aww+aww_gifs+hardcoreaww
    .then(res => {
      res.data.data.children.forEach(child => {
        if (child.data.domain != 'reddit.com' && child.data.domain != 'v.redd.it' && child.data.preview && !child.data.is_self) {
          out = {};
          if (!child.data.preview.images[0].variants.mp4) {
            base = child.data.preview.images[0];
            out.type = 'image';
          } else {
            base = child.data.preview.images[0].variants.mp4;
            out.type = 'video';
          }
          out.source = base.source;
          out.resolutions = base.resolutions;
          out.ar = base.source.width / base.source.height;

          out.source.url = out.source.url.replace(/amp;/g, '');
          out.resolutions.forEach(resolution => {
            resolution.url = resolution.url.replace(/amp;/g, '');
          });

          allPosts.push(out);
        }
      });
      after = res.data.data.after;
      app.posts = [];
      resized();
    })
    .catch(err => {
      console.log(err);
    });
}

function resized() {
  cw = document.getElementById('app').offsetWidth - 6.1;
  aspRatAll = 0;
  temp = [];
  allPosts.forEach(post => {
    temp.push(post);
    aspRatAll += post.ar;
    h = cw / aspRatAll;
    if (h < 250) {
      temp.forEach(post => {
        post.nwidth = (h * post.ar) - 6;
        post.nheight = h - 6;
        post.resolutions.some(resolution => {
          if (resolution.width >= post.nwidth && resolution.height >= post.nheight) {
            post.thumb = resolution.url;
            return true;
          }
        });
        if (!post.thumb) {
          post.thumb = post.source.url;
          post.show = post.source.url;
        } else {
          post.show = post.resolutions[post.resolutions.length - 1].url;
        }
      });
      app.posts = app.posts.concat(temp);
      temp = [];
      aspRatAll = 0;
    }
  });
  loading = false;
}
