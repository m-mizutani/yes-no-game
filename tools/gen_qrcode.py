#!/usr/bin/env python
# coding: utf-8

import os
import sys
import qrcode
import re

def gen_images(hostname, fname, wd):
    img_files = []
    for line in open(fname, 'r'):
        cid = line.strip()
        if len(cid) == 0: continue

        url = 'http://' + hostname + '/c/' + cid
        img = qrcode.make(url)
        img_path = os.path.join(wd, '{0}.png'.format(cid))
        img_files.append((url, img_path))
        img.save(img_path)

    return img_files

def gen_html(img_files, work_dir):
    header = '''<html>
  <head>
    <style type="text/css">
      hr.newpage { page-break-after: always;
      clear: both; }
      img {width: 160px;}
      div.detail {font-size: 10pt; }
      div.left { float: left; width: 360px; }
      div.center { margin-left: 40px; float: left; width: 360px;}
      div.right  { margin-left: 800px;  width: 360px;}
      h1 { margin: 5px; }
      h2 { margin: 40px 0px 5px 0px; }
      pre { margin: 0px; }
    </style>
  </head>
  <body>
'''
    footer = '</body></html>'
    fd = open(os.path.join(work_dir, 'list.html'), 'w')
    fd.write(header + '\n')

    c = 0
    for url, img in img_files:
        data = '''
      <h1>二次会御出席の皆様へ</h1>
      <h2>1. 余興用サイトのお知らせ</h2>
      <div class="detail">
	本日の二次会にてインターネットサイトへのアクセスを利用した余興を
	ご用意しております。以下のQRコード、またはURLからごアクセスください。
	このQRコード、URLは個々人で異なりますので、
	余興開始までなくさないようご注意ください.
      </div>
      <img src="{0}" />
      <pre>URL: {1}</pre>
      
      <h2>2. 新郎新婦より<br>本日のお写真の共有のお願い</h2>
      <div class="detail">
	以下サイトからアプリをダウンロードして、お写真の共有にご協力ください！
      </div>
      <img src="../data/photo.jpg">
'''

        if   c % 3 == 0: fd.write('<div class="left">\n')
        elif c % 3 == 1: fd.write('<div class="center">\n')
        elif c % 3 == 2: fd.write('<div class="right">\n')
        fd.write(data.format(img, url))
        fd.write('</div>\n')
        if c % 3 == 2: fd.write('<br style="clear:both;"><hr class="newpage">\n')
        c += 1
        # if c % 2 == 0: fd.write('\\newpage\n')
        
    fd.write(footer + '\n')
    

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print 'syntax) {0} <hostname> <id_list.txt> <work_dir>'.format(sys.argv[0])
        exit(0)

    work_dir = sys.argv[3]
    img_files = gen_images(sys.argv[1], sys.argv[2], work_dir)
    gen_html(img_files, work_dir)
    
