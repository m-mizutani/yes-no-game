#!/usr/bin/env python

import random
import string
import sys

def id_gen(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

if len(sys.argv) != 2:
    print 'syntax) {0} <num>'.format(sys.argv[0])
else:
    for i in range(int(sys.argv[1])):
        print id_gen(6, string.ascii_uppercase)

