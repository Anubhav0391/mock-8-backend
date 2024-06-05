const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const fs = require('fs');


server.use(middlewares);

const processesOrder = [
  'product',
  'social_media',
  'product_metadata',
  'product_word_map',
  'product_external',
  'product_swot',
  'product_pest',
  'product_cem',
  'icp_segment',
  'icp_persona'
];

const planProcessesOrder = [
  'icp_graph',
  'industry_analysis'
];

const updateStatus = (currentStatus) => {
  for (let i = 0; i < processesOrder.length; i++) {
    const process = processesOrder[i];
    if (!currentStatus[process]) {
      currentStatus[process] = { status: 'registered', timestamp: Date.now() };
      break;
    } else if (currentStatus[process].status === 'registered') {
      currentStatus[process].status = 'in_progress';
      currentStatus[process].timestamp = Date.now();
      break;
    } else if (currentStatus[process].status === 'in_progress') {
      if (Date.now() - currentStatus[process].timestamp >= 60000) {
        currentStatus[process].status = 'completed';
        currentStatus[process].timestamp = Date.now();
      }
      break;
    }
  }
  return currentStatus;
};

const updatePlanStatus = (currentStatus) => {
  for (let i = 0; i < planProcessesOrder.length; i++) {
    const process = planProcessesOrder[i];
    if (!currentStatus[process]) {
      currentStatus[process] = { status: 'registered', timestamp: Date.now() };
      break;
    } else if (currentStatus[process].status === 'registered') {
      currentStatus[process].status = 'in_progress';
      currentStatus[process].timestamp = Date.now();
      break;
    } else if (currentStatus[process].status === 'in_progress') {
      if (Date.now() - currentStatus[process].timestamp >= 60000) {
        currentStatus[process].status = 'completed';
        currentStatus[process].timestamp = Date.now();
      }
      break;
    }
  }
  return currentStatus;
};

server.get('/status', (req, res) => {
  const db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
  const items = db.items;

  items.forEach(item => {
    if (item.type === 'product_level') {
      item.status = updateStatus(item.status);
    }
  });

  const allCompleted = items.every(item => {
    if (item.type === 'product_level') {
      return processesOrder.every(process => item.status[process] && item.status[process].status === 'completed');
    }
    return true;
  });

  if (allCompleted) {
    items.forEach(item => {
      if (item.type === 'plan_level') {
        item.status = updatePlanStatus(item.status);
      }
    });
  }

  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
  res.json(items);
});

server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running at http://localhost:3000');
});
