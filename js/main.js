var posts = [];
var after = '';
var loading;

const app = new Vue({
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
  axios.get('https://www.reddit.com/r/aww+aww_gifs+hardcoreaww/.json?limit=50&after=' + after)
    .then(res => {
      res.data.data.children.forEach(child => {
        if (child.data.domain != 'reddit.com' && child.data.domain != 'v.redd.it' && child.data.preview) {
          if (!child.data.preview.images[0].variants.mp4) {
            base = child.data.preview.images[0].resolutions;
            type = 'image';
          } else {
            base = child.data.preview.images[0].variants.mp4.resolutions;
            type = 'video';
          }
          data = base[2] || base[1] || base[0];
          data.type = type;
          data.source = base[base.length - 1].url.replace(/amp;/g, '');
          data.url = data.url.replace(/amp;/g, '');
          posts.push(data);
        }
      });
      after = res.data.data.after;
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
      posts = [];
      aspRatAll = 0;
      loading = false;
    }
  });
}
