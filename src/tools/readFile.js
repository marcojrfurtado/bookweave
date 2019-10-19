const readFile = (data) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort()
        reject()
      }
      reader.addEventListener("load", () => {
          resolve({ file: reader.result, name: data.name })
    }, false)
      reader.readAsArrayBuffer(data)
    })
}

export default readFile