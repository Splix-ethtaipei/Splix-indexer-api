import { Express } from "express";
import { GroupService } from "../services/GroupService";

export const groupApi = (app: Express, groupService: GroupService) => {
    // get groups joined by user
    app.get('/groups/joined/:user', async (req, res) => {
        const { user } = req.params;
        const groups = await groupService.getGroupsJoinedByUser(user);
        res.json(groups);
    })

    // get groups requested to join by user
    app.get('/groups/request/:user', async (req, res) => {
        try {
            const { user } = req.params;
            const groups = await groupService.getGroupsRequestToJoinByUser(user);
            res.json(groups);
        } catch (error) {
            console.error('Error getting groups requested by user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })

    // get group by id and chain id
    app.get('/groups/:groupId/:chainId', async (req, res) => {
        try {
            const { groupId, chainId } = req.params;
            const group = await groupService.getGroupById(parseInt(groupId), parseInt(chainId));
            res.json(group);
        } catch (error) {
            console.error('Error getting group by ID:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })

    // join group
    app.post('/groups/join', async (req, res) => {
        try {
            const { user, groupId, chainId } = req.body;
            const groupIdNumber = parseInt(groupId);
            await groupService.joinGroup(user, groupIdNumber, chainId);
            res.json({ success: true });
        } catch (error) {
            console.error('Error joining group:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })

    // reject join group
    app.post('/groups/reject', async (req, res) => {
        try {
            const { user, groupId, chainId } = req.body;
            const groupIdNumber = parseInt(groupId);
            await groupService.rejectJoinGroup(user, groupIdNumber, chainId);
            res.json({ success: true });
        } catch (error) {
            console.error('Error rejecting group join request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })

}