// TODO: uid
const uid = 0;
const show = console.log;

async function start() {
  console.log('backup starting');
  const blogs = await fetchBlogs(uid);
  show('fetch blogs done, and then start fetching comments=====>');

  const results = await fetchBlogsComments(blogs, uid);

  show('fetch all done, the results is: ', results);

  download(JSON.stringify(results), `weibo_${uid}_backup.json`, 'text/plain');
}

function download(content, fileName, contentType) {
  var a = document.createElement('a');
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(a.href);
}

start();

function sleep(time) {
  return new Promise(resolve => {
    show(`sleep ${time}...`);
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

async function fetchBlogs(uid, page = 1, count = 20, totalBlogs = []) {
  const blogs = await fetchBlog(uid, page, count);
  if (blogs.length < count) {
    return totalBlogs.concat(blogs);
  } else {
    await sleep(100);

    return fetchBlogs(uid, page + 1, count, totalBlogs.concat(blogs));
  }
}

function simplifyBlogs(data) {
  if (data.ok === 1) {
    return data.data.list.map(item => {
      const { id, idstr, created_at, text_raw, text, textLength, source, comments_count, region_name } = item;
      return {
        id,
        idstr,
        created_at,
        text,
        text_raw,
        textLength,
        source,
        comments_count,
        region_name,
        comments: [],
      };
    });
  } else {
    return [];
  }
}

async function fetchBlogsComments(blogs, uid) {
  for await (const blog of blogs) {
    const { idstr, comments_count } = blog;
    if (comments_count > 0) {
      const comments = await fetchBlogComments(idstr, comments_count, uid);

      blog.comments = comments;
      await sleep(100);
    }
  }

  return blogs;
}

function simplifyComments(data) {
  if (data.ok === 1) {
    return data.data.map(item => {
      const { created_at, floor_number, text, text_raw, source, rootid, rootidstr, id, idstr } = item;

      return { created_at, floor_number, text, text_raw, source, rootid, rootidstr, id, idstr };
    });
  } else {
    return [];
  }
}

function fetchBlog(uid, page, count, feature = 0) {
  show(`fetching ${uid}'s blogs page: ${page}=====>`);
  return fetch(`https://weibo.com/ajax/statuses/mymblog?uid=${uid}&page=${page}&feature=${feature}&count=${count}`)
    .then(resp => resp.json())
    .then(data => simplifyBlogs(data));
}

function fetchBlogComments(id, count, uid) {
  show(`fetch comments of blog ${id}=====>`);
  return fetch(`https://weibo.com/ajax/statuses/buildComments?is_reload=1&id=${id}&is_show_bulletin=2&is_mix=0&count=${count}&uid=${uid}`)
    .then(resp => resp.json())
    .then(data => simplifyComments(data));
}
