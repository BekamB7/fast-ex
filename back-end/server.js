// server.js
import 'dotenv/config'
import app from './src/index.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Fast-Ex API listening on http://localhost:${PORT}`)
  console.log(`API index: http://localhost:${PORT}/api`)
  console.log(`API documentation: http://localhost:${PORT}/api/docs`)
})