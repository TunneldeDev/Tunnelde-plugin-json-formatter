import assert from 'node:assert/strict';import { test } from 'node:test';import { spawnSync } from 'node:child_process';import { join } from 'node:path';import { pathToFileURL } from 'node:url';const root=process.cwd();
import {runCommand as json,renderView as jsonView} from "../index.mjs";
test("JSON pretty/minify preserve numeric precision, duplicate keys and literal whitespace", () => {
  const source =
    ' { "big": 900719925474099312345, "big":1e+200, "empty":{}, "array": [ true, null, " a  b \\n" ] } ';
  const compact = json("minify", { source }).text;
  assert.equal(
    compact,
    '{"big":900719925474099312345,"big":1e+200,"empty":{},"array":[true,null," a  b \\n"]}',
  );
  const pretty = json("pretty", { source, indent: "tab" }).text;
  assert.ok(pretty.includes('\n\t"big": 900719925474099312345,'));
  assert.equal(json("minify", { source: pretty }).text, compact);
  assert.equal(json("pretty", { source: "[]" }).text, "[]");
  assert.equal(json("pretty", { source: '" x "' }).text, '" x "');
  assert.equal(json("pretty", { source: '{"a":[]}', indent: "4" }).text, '{\n    "a": []\n}');
});


test("JSON errors contain position, line, column, and views localize", () => {
  const source = '{\n "ok":1,\n bad\n}';
  const result = json("pretty", { source });
  assert.equal(result.error, true);
  assert.equal(result.line, 3);
  assert.ok(result.column >= 2);
  assert.equal(source.slice(0, result.position).split("\n").length, result.line);
  assert.match(json("pretty", { source: "", _locale: "zh-CN" }).title, /无效/);
  assert.equal(jsonView("zh-CN").blocks[1].fields[0].label, "JSON 输入");
});


test("deep JSON pretty printing fails promptly while minifying stays available", () => {
  const source = "[".repeat(1000) + "0" + "]".repeat(1000);
  assert.equal(json("pretty", { source }).error, true);
  assert.equal(json("minify", { source }).text, source);
});
