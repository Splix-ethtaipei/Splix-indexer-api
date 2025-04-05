import express from 'express';
import cors from 'cors';
import { DataSource, EntityManager } from 'typeorm';
import { GroupService } from './services/GroupService';
import { ItemService } from './services/ItemService';
import { Group } from './entity/Group';
import { Item } from './entity/Item';
import { AppDataSource } from './data-source';
import { groupApi } from './api/groupApi';
import { scanReceiptApi } from './api/scanReceiptApi';

const app = express();
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://yourdomain.com'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(express.json({ limit: '50mb' }));
app.use(cors());
// Initialize services
AppDataSource.initialize()
    .then(db => {
        const groupService = new GroupService(db);
        const itemService = new ItemService();

        // Groups endpoints
        groupApi(app, groupService);
        
        // Receipt scanning endpoint
        scanReceiptApi(app);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    });
// app.get('/groups/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const manager = new EntityManager(AppDataSource);
//         const group = await manager.findOne(Group, { where: { id: parseInt(id) } });
//         if (!group) {
//             return res.status(404).json({ error: 'Group not found' });
//         }
//         res.json(group);
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/groups', async (req, res) => {
//     const group = new Group();
//     Object.assign(group, req.body);

//     try {
//         await AppDataSource.transaction(async (manager: EntityManager) => {
//             await groupService.insertGroup(manager, group);
//         });
//         res.status(201).json(group);
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Items endpoints
// app.get('/items/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const manager = new EntityManager(AppDataSource);
//         const item = await manager.findOne(Item, { where: { id: parseInt(id) } });
//         if (!item) {
//             return res.status(404).json({ error: 'Item not found' });
//         }
//         res.json(item);
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/items', async (req, res) => {
//     const item = new Item();
//     Object.assign(item, req.body);

//     try {
//         await AppDataSource.transaction(async (manager: EntityManager) => {
//             await itemService.insertItem(manager, item);
//         });
//         res.status(201).json(item);
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


