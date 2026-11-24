import json, io, re
data = json.load(open('data.json', encoding='utf-8'))
tpl = open('app.template.html', encoding='utf-8').read()
payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
# 안전: 스크립트 태그 종료 방지
payload = payload.replace('</', '<\\/')
import base64
reg = base64.b64encode(open('font-reg.woff','rb').read()).decode()
bold = base64.b64encode(open('font-bold.woff','rb').read()).decode()
out = tpl.replace('__FONT_REG__', reg).replace('__FONT_BOLD__', bold)
out = out.replace('/*__DATA__*/', payload)
open('index.html','w',encoding='utf-8').write(out)
print('index.html bytes:', len(out.encode()), '| videos:', len(data['videos']), '| sentences:', sum(len(v['sentences']) for v in data['videos'].values()))
