import dayjs from 'dayjs';
import blogs from '../data/weibo_uid_backup.json';
import { MyBlog, SimpleComment } from './service/base';
import fs from 'fs';

const show = console.log;

function convertToChinaNum(num: number) {
  const arr1 = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const arr2 = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万', '十', '百', '千', '亿']; //可继续追加更高位转换值
  if (!num || isNaN(num)) {
    return '零';
  }
  const english = num.toString().split('');
  let result = '';
  for (let i = 0; i < english.length; i++) {
    const des_i = english.length - 1 - i;
    result = arr2[i] + result;
    const arr1_index = english[des_i];
    result = arr1[+arr1_index] + result;
  }
  result = result.replace(/零(千|百|十)/g, '零').replace(/十零/g, '十');
  result = result.replace(/零+/g, '零');
  result = result.replace(/零亿/g, '亿').replace(/零万/g, '万');
  result = result.replace(/亿万/g, '亿');
  result = result.replace(/零+$/, '');
  result = result.replace(/^一十/g, '十');

  return result;
}

function formatBlogs(blogs: MyBlog[]) {
  let dateStr = '';
  let chapter = 1;
  const textArr = blogs.reverse().map(blog => {
    const str = formatBlog(blog);
    const date = dayjs(new Date(blog.created_at));
    const curDateStr = dayjs(new Date(blog.created_at)).format('YYYYMMDD');
    let prefix = '';
    if (curDateStr !== dateStr) {
      prefix = `第${convertToChinaNum(chapter)}章 ${date.format('YYYY年MM月DD日')}\n\n`;
      chapter += 1;
    }
    dateStr = curDateStr;

    return prefix + str;
  });

  show(textArr);
  fs.writeFile('./data/weibo.txt', textArr.join('\n'), () => {
    show('all done...');
  });
}

function formatBlog(blog: MyBlog) {
  const date = dayjs(new Date(blog.created_at)).format('HH点mm分');
  const str = `${date}\n\n${blog.text_raw}`;
  const comments = blog.comments.map(formatComment).reverse();

  return `${str}\n\n${comments.join('\n')}\n\n`;
}

function formatComment(comment: SimpleComment) {
  return comment.text;
}

formatBlogs(blogs as any);
