import JobRole from '../../models/JobRole';
import mongoose from 'mongoose';
export async function handler(req, res) {
    if (!mongoose.connections[0].readyState) {
        await mongoose.connect(process.env.MONGODB_URI)
      }
  const { email ,_id} = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email parameter is required' });
  }

  // Handle GET request (fetch questions)
  if (req.method === 'GET') {
    try {
      // Attempt to find the job role by email
      const jobRole = await JobRole.findOne({ email , _id});

      if (!jobRole) {
        return res.status(404).json({ message: 'Job role not found' });
      }

      // Using the original array order instead of sorting by creation date
      const questions = jobRole.questions
        .map(q => ({
          questionText: q.questionText,
          answer: q.answer || '', // Provide an empty string if the answer is null
          _id: q._id,  // Only return the _id and question text/answer
        }));

      return res.status(200).json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error); // Log the actual error
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Handle PUT request (update answer)
  if (req.method === 'PUT') {
    const { questionId, answer } = req.body;

    if (!questionId || answer === undefined) {
      return res.status(400).json({ message: 'Both questionId and answer are required' });
    }

    try {
      // Attempt to find the job role by email
      const jobRole = await JobRole.findOne({ email });

      if (!jobRole) {
        return res.status(404).json({ message: 'Job role not found' });
      }

      // Find the question to update using the questionId
      const question = jobRole.questions.id(questionId);

      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      // Update the answer
      question.answer = answer;

      // Save the updated job role
      await jobRole.save();

      return res.status(200).json({ message: 'Answer updated successfully' });
    } catch (error) {
      console.error('Error updating answer:', error); // Log the actual error
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // If the method is not GET or PUT
  return res.status(405).json({ message: 'Method Not Allowed' });
}

export default handler;