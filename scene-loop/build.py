import json, base64

data = json.load(open('data.json', encoding='utf-8'))
tpl = open('app.template.html', encoding='utf-8').read()
payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
payload = payload.replace('</', '<\\/')          # 스크립트 태그 조기 종료 방지

reg = base64.b64encode(open('font-reg.woff', 'rb').read()).decode()
bold = base64.b64encode(open('font-bold.woff', 'rb').read()).decode()

out = tpl.replace('__FONT_REG__', reg).replace('__FONT_BOLD__', bold).replace('/*__DATA__*/', payload)
open('index.html', 'w', encoding='utf-8').write(out)

lines = sum(len(c['lines']) for c in data['clips'])
print('index.html bytes:', len(out.encode()), '| clips:', len(data['clips']), '| lines:', lines)
