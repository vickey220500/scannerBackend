const express = require('express')
const app = express();
const cors = require('cors');
const localroutes = require('./routes/excelRoutes');
const routes = require ('./routes/excelGoogleRoutes');
app.use(cors())
app.use(express.json())
app.use('/api',routes);
app.use('/api/local',localroutes);


const PORT = 3000;
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
});