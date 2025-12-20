
let html = ''
document.addEventListener('DOMContentLoaded', async function () {
  await fetch('frame.html')
    .then(res => res.text())
    .then(res => {
      html = res
    })

  const htemplate = (html, data_object) => {
    const template = Handlebars.compile(html.replace("<data-style>", style_value).replace("<data-text-area>", data_value))
    iframe.srcdoc = template(data_object)
  }
  const iframe = document.querySelector('iframe')
  let data_value = ''
  let style_value = ''
  let data_object = ''
  const data = document.getElementById('data-text-area')
  data.addEventListener('input', function (e) {
    data_value = e.target.value
    data_value = row(data_value)
    data_value = col(data_value)
    htemplate(html, data_object)
  })
  const style = document.getElementById('style-text-area')
  style.addEventListener('input', function (e) {
    style_value = e.target.value
    htemplate(html, data_object)
  })
  const object = document.getElementById('object-text-area')
  object.addEventListener('input', function (e) {
    data_object = JSON.parse(e.target.value)
    console.log(data_object)
    htemplate(html, data_object)
  })
})
const row = (data) => {
  data = data.replace(/<row>/g, `<div class=" w-full h-fit flex flex-row gap-1 border-2 [&>*]:border-2 [&>*]:border-purple-500 border-red-500">`)
  data = data.replace(/<\/row>/g, `</div>`)
  return data
}
const col = (data) => {
  data = data.replace(/<col>/g, `<div class=" w-full h-fit flex flex-col gap-1 border-2 [&>*]:border-2 [&>*]:border-purple-500 border-yellow-500">`)
  data = data.replace(/<\/col>/g, `</div>`)
  return data
}
