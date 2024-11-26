const express = require('express')
const app = express();
const cors = require('cors');
const routes = require('./routes/excelRoutes')
app.use(cors())
app.use(express.json())
app.use('/api',routes);


const PORT = 3000;
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
});