import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import Project from '../../../models/Project';

// eslint-disable-next-line consistent-return
export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		const projects = await Project.find({}).exec()
			.catch(() => {
				res.status(500).end();
			});

		res.status(200).json(projects);
	} else if (req.method === 'POST') {
		const session = await getSession({ req });
		if (!session) return res.status(401).end();

		const project = new Project(req.body);

		project.save((err) => {
			if (err) res.status(500).end();
			else res.status(200).json(project);
		});
	} else res.status(404).end();
};