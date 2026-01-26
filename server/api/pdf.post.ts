import { defineEventHandler, readBody, createError } from 'h3'
import { withPuppeteer } from '../utils/puppeteer'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ html?: string }>(event)

  if (!body?.html) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing html payload',
    })
  }
  const pdfBuffer = await withPuppeteer(async (page) => {
    await page.setContent(body.html, {
      waitUntil: 'networkidle0',
    })

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    })

    return buffer
  })

  event.node.res.setHeader(
    'Content-Type',
    'application/pdf'
  )
  event.node.res.setHeader(
    'Content-Disposition',
    'inline; filename="document.pdf"'
  )

  return pdfBuffer
})

