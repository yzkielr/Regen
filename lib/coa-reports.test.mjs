import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'
import { COA_REPORTS, getCoaReport, getCoaDocument } from './coa-reports.ts'

test('every supplied PDF is assigned once to a unique, clean product URL', async () => {
  assert.equal(COA_REPORTS.length, 28)
  assert.equal(new Set(COA_REPORTS.map((report) => report.slug)).size, 28)
  const assigned = []
  for (const report of COA_REPORTS) {
    assert.match(report.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.equal(new Set(report.documents.map((document) => document.id)).size, report.documents.length)
    for (const document of report.documents) {
      assigned.push(document.filename)
      assert.ok(document.pages > 0)
      const bytes = await readFile(new URL(`../lab-documents/coa/${document.filename}`, import.meta.url))
      assert.equal(bytes.subarray(0, 5).toString(), '%PDF-')
    }
  }
  const supplied = await readdir(new URL('../lab-documents/coa/', import.meta.url))
  assert.equal(new Set(assigned).size, 28)
  assert.deepEqual(assigned.sort(), supplied.sort())
})

test('unknown products, document IDs and traversal attempts are rejected', () => {
  for (const slug of ['', 'unknown', '../retatrutide', 'constructor', 'toString', 'Tirzepatide']) {
    assert.equal(getCoaReport(slug), undefined)
    assert.equal(getCoaDocument(slug, 'report'), undefined)
  }
  for (const id of ['', '../report', '../../.env.local', 'constructor', 'janoshik']) {
    assert.equal(getCoaDocument('tirzepatide', id), undefined)
  }
})

test('Retatrutide 10 mg and 60 mg each serve only their own report', () => {
  assert.equal(getCoaReport('retatrutide-10mg').name, 'Retatrutide 10 mg')
  assert.equal(getCoaReport('retatrutide-60mg').name, 'Retatrutide 60 mg')
  assert.equal(getCoaReport('retatrutide-10mg').documents.length, 1)
  assert.equal(getCoaReport('retatrutide-60mg').documents.length, 1)
  assert.match(getCoaDocument('retatrutide-10mg', 'report').filename, /10mg_COA_Vanguard/)
  assert.match(getCoaDocument('retatrutide-60mg', 'janoshik').filename, /janoshik/)
  assert.equal(getCoaDocument('retatrutide-10mg', 'janoshik'), undefined)
  assert.equal(getCoaDocument('retatrutide-60mg', 'report'), undefined)
  assert.equal(getCoaReport('retatrutide'), undefined)
  assert.match(getCoaDocument('cjc-1295-with-dac', 'report').filename, /_With_DAC_/)
  assert.match(getCoaDocument('cjc-1295-without-dac', 'report').filename, /_Without_DAC_/)
  assert.match(getCoaDocument('bpc-157-tb-500', 'report').filename, /BPC-157_TB-500/)
})
