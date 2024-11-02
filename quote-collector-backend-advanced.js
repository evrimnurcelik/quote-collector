// server.js - Updated quote routes with pagination and sorting

// ... (previous code remains the same until quote routes)

// Quote Routes
app.get('/api/quotes', authenticateToken, async (req, res) => {
  try {
    const {
      search,
      collection,
      tags,
      page = 1,
      limit = 9,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = { userId: req.user.userId };
    const skip = (page - 1) * limit;

    // Search functionality
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    // Collection filter
    if (collection) {
      query.collection = collection;
    }

    // Tags filter
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Create sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const quotes = await Quote.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Quote.countDocuments(query);

    res.json({
      quotes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quotes', error: error.message });
  }
});

// Add stats endpoint
app.get('/api/quotes/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Quote.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(req.user.userId) } },
      {
        $group: {
          _id: null,
          totalQuotes: { $sum: 1 },
          uniqueAuthors: { $addToSet: '$author' },
          uniqueTags: { $addToSet: '$tags' },
          uniqueCollections: { $addToSet: '$collection' }
        }
      },
      {
        $project: {
          _id: 0,
          totalQuotes: 1,
          uniqueAuthors: { $size: '$uniqueAuthors' },
          uniqueTags: { $size: { $reduce: {
            input: '$uniqueTags',
            initialValue: [],
            in: { $setUnion: ['$$value', '$$this'] }
          }}},
          uniqueCollections: { $size: '$uniqueCollections' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalQuotes: 0,
      uniqueAuthors: 0,
      uniqueTags: 0,
      uniqueCollections: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});
