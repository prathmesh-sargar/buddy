const Project = require('../models/Project');

// @route  POST /api/projects
const createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, interests, maxTeamSize } = req.body;
    const project = await Project.create({
      title, description,
      requiredSkills: requiredSkills || [],
      interests: interests || [],
      maxTeamSize: maxTeamSize || 5,
      createdBy: req.user._id,
      teamMembers: [req.user._id], // Creator auto-joins
    });
    await project.populate('createdBy', 'name role');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name role')
      .populate('teamMembers', 'name role skills')
      .populate('pendingRequests', 'name role skills')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/projects/join/:id
const joinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.teamMembers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    
    if (project.pendingRequests.includes(req.user._id)) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    if (project.teamMembers.length >= project.maxTeamSize) {
      return res.status(400).json({ message: 'Team is full' });
    }

    project.pendingRequests.push(req.user._id);
    await project.save();
    await project.populate('createdBy', 'name role');
    await project.populate('teamMembers', 'name role skills');
    await project.populate('pendingRequests', 'name role skills');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/projects/approve/:id/:userId
const approveJoinRequest = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only creator can approve
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!project.pendingRequests.includes(req.params.userId)) {
      return res.status(400).json({ message: 'Request not found' });
    }

    if (project.teamMembers.length >= project.maxTeamSize) {
      return res.status(400).json({ message: 'Team is full' });
    }

    // Move from pending to teamMembers
    project.pendingRequests = project.pendingRequests.filter(
      (id) => id.toString() !== req.params.userId
    );
    project.teamMembers.push(req.params.userId);

    await project.save();
    await project.populate('createdBy', 'name role');
    await project.populate('teamMembers', 'name role skills');
    await project.populate('pendingRequests', 'name role skills');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/projects/reject/:id/:userId
const rejectJoinRequest = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only creator can reject
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    project.pendingRequests = project.pendingRequests.filter(
      (id) => id.toString() !== req.params.userId
    );

    await project.save();
    await project.populate('createdBy', 'name role');
    await project.populate('teamMembers', 'name role skills');
    await project.populate('pendingRequests', 'name role skills');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/projects/leave/:id
const leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.teamMembers = project.teamMembers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await project.save();
    res.json({ message: 'Left project' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/projects/my
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { teamMembers: req.user._id },
        { createdBy: req.user._id }
      ]
    })
      .populate('createdBy', 'name role')
      .populate('teamMembers', 'name role skills')
      .populate('pendingRequests', 'name role skills');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  createProject, 
  getProjects, 
  joinProject, 
  approveJoinRequest, 
  rejectJoinRequest, 
  leaveProject, 
  getMyProjects 
};
