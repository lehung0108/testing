const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Helper: Generate 200 fake items
const generateItems = () => {
  const items = [];
  for (let i = 1; i <= 200; i++) {
    items.push({
      id: `C${i}`,
      reportName: `Report Campaign ${i}`,
      audience: `Audience ${i % 5 === 0 ? 'Adults 18+' : 'Teens 12+'}`,
      creationDate: new Date(Date.now() - i * 86400000).toISOString(), // decreasing dates
      byAuth: `https://picsum.photos/id/${i}/200/200`,
      status: i % 3 === 0 ? 'COMPLETE' : 'PENDING',
      role: i % 2 === 0 ? 1 : 2
    });
  }
  return items;
};

// Generated items
const ITEMS = generateItems();

// POST route with sorting and pagination
app.post('/api/v1/cflight/search', (req, res) => {
    let {
      pageNumber = 1,
      pageSize = 20,
      isDescending = false,
      sortBy = 'creationDate'
    } = req.body;
  
    pageNumber = Math.max(parseInt(pageNumber, 10), 1);
    pageSize = Math.max(parseInt(pageSize, 10), 1);
  
    const validSortFields = ['id', 'reportName', 'audience', 'creationDate', 'status', 'role'];
    if (!validSortFields.includes(sortBy)) sortBy = 'creationDate';
  
    // Sorting logic (dynamic based on sortBy field)
    const sortedItems = ITEMS.sort((a, b) => {
      const valA = a[sortBy].toLowerCase ? a[sortBy].toLowerCase() : a[sortBy];
      const valB = b[sortBy].toLowerCase ? b[sortBy].toLowerCase() : b[sortBy];
  
      if (valA < valB) return isDescending ? 1 : -1;
      if (valA > valB) return isDescending ? -1 : 1;
      return 0;
    });
  
    const startIndex = (pageNumber - 1) * pageSize;
    const pagedItems = sortedItems.slice(startIndex, startIndex + pageSize);
  
    const response = {
      statusCode: 200,
      message: "CFlight reports fetched successfully.",
      data: {
        items: pagedItems,
        totalItems: ITEMS.length,
        pageNumber,
        pageSize,
        sortBy,
        isDescending
      }
    };
  
    res.status(200).json(response);
  });

// Root endpoint
app.get('/', (req, res) => res.send('Express API is running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
