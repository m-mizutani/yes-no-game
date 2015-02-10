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
        img_files.append(img_path)
        img.save(img_path)

    return img_files

def gen_tex(img_files, work_dir):
    header = '''\\documentclass[twocolumn,10pt]{jarticle} 
\\setlength{\\columnsep}{6zw}
\\setlength{\\textheight}{\\paperheight}
\\setlength{\\topmargin}{-10mm}
\\addtolength{\\topmargin}{-\\headheight}
\\addtolength{\\topmargin}{-\\headsep}
\\addtolength{\\textheight}{-30truemm}
\\setlength{\\textwidth}{\\paperwidth}
\\setlength{\\oddsidemargin}{-10truemm}
\\setlength{\\evensidemargin}{-0.4truemm}
\\addtolength{\\textwidth}{-30truemm}
\\usepackage[dvipdfmx]{graphicx}
\\begin{document} '''

    footer = '\\end{document}'
    fd = open(os.path.join(work_dir, 'list.tex'), 'w')
    fd.write(header + '\n')

    c = 0
    for img in img_files:
        data = '''
二次会中のゲーム用のQRコードになります。
携帯もしくはスマートフォンで読み込ませ、
何か不具合がありましたら、幹事までご連絡ください。

\\begin{figure}[h]
  \\includegraphics[width=3cm]{__IMG__}
\\end{figure}

新郎新婦より　本日のお写真の共有のお願い
以下サイトからアプリをダウンロードして、お写真の共有にご協力ください！

\\begin{figure}[hb]
  \\includegraphics[width=4cm]{../data/photo.jpg}
\\end{figure}

\\newpage
'''
        data = re.sub(r'__IMG__', img, data)
        fd.write(data)
        c += 1
        # if c % 2 == 0: fd.write('\\newpage\n')
        
    fd.write(footer + '\n')
    

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print 'syntax) {0} <hostname> <id_list.txt> <work_dir>'.format(sys.argv[0])
        exit(0)

    work_dir = sys.argv[3]
    img_files = gen_images(sys.argv[1], sys.argv[2], work_dir)
    gen_tex(img_files, work_dir)
    
