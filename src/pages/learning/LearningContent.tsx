import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Award, ArrowLeft, ArrowRight, Play, Download, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ContentPreference from '../../components/student/ContentPreference';

const LearningContent: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user, supabase } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'quizzes' | 'resources'>('content');
  const [contentType, setContentType] = useState<'video' | 'text'>('text');
  const [courseContent, setCourseContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>({
    completedLessons: 0,
    totalLessons: 0
  });
  const [quizzes, setQuizzes] = useState<any[]>([]);
  
  // Mock data for the learning content
  const topicData = {
    nutrition: {
      title: 'Nutrition & Healthy Eating',
      description: 'Learn about balanced diets, nutrients, and making healthy food choices.',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Understanding Nutrition</h2>
        <p>Nutrition is the science that interprets the nutrients and other substances in food in relation to maintenance, growth, reproduction, health and disease of an organism. It includes food intake, absorption, assimilation, biosynthesis, catabolism and excretion.</p>
        
        <h3>Why is Nutrition Important?</h3>
        <p>Good nutrition is an important part of leading a healthy lifestyle. Combined with physical activity, your diet can help you to reach and maintain a healthy weight, reduce your risk of chronic diseases (like heart disease and cancer), and promote your overall health.</p>
        
        <h3>The Six Essential Nutrients</h3>
        <ul>
          <li><strong>Carbohydrates:</strong> The body's main source of energy</li>
          <li><strong>Proteins:</strong> Essential for building and repairing tissues</li>
          <li><strong>Fats:</strong> Necessary for nutrient absorption, nerve transmission, and maintaining cell membrane integrity</li>
          <li><strong>Vitamins:</strong> Organic compounds essential for normal growth and nutrition</li>
          <li><strong>Minerals:</strong> Inorganic elements that aid in body processes</li>
          <li><strong>Water:</strong> Essential for hydration and many bodily functions</li>
        </ul>
        
        <h2>Building a Balanced Diet</h2>
        <p>A balanced diet provides the nutrients your body needs to function correctly. To get the nutrition you need, most of your daily calories should come from:</p>
        
        <ul>
          <li>Fresh fruits</li>
          <li>Fresh vegetables</li>
          <li>Whole grains</li>
          <li>Legumes</li>
          <li>Lean proteins</li>
          <li>Healthy fats</li>
        </ul>
        
        <p>These foods should provide the right amount of calories to maintain your weight, along with a wide range of nutrients.</p>
      `
    },
    'physical-activity': {
      title: 'Physical Activity & Fitness',
      description: 'Discover the importance of exercise, different types of physical activities, and fitness tips.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>The Importance of Physical Activity</h2>
        <p>Regular physical activity is one of the most important things you can do for your health. Being physically active can improve your brain health, help manage weight, reduce the risk of disease, strengthen bones and muscles, and improve your ability to do everyday activities.</p>
        
        <h3>Benefits of Regular Exercise</h3>
        <ul>
          <li>Helps control weight</li>
          <li>Reduces risk of heart diseases</li>
          <li>Helps manage blood sugar and insulin levels</li>
          <li>Improves mental health and mood</li>
          <li>Strengthens bones and muscles</li>
          <li>Reduces risk of some cancers</li>
          <li>Improves sleep quality</li>
          <li>Increases chances of living longer</li>
        </ul>
        
        <h2>Types of Physical Activity</h2>
        <p>Different types of physical activity offer different benefits:</p>
        
        <h3>Aerobic Activity</h3>
        <p>Also called cardio, aerobic activities make you breathe harder and your heart beat faster. Examples include:</p>
        <ul>
          <li>Brisk walking</li>
          <li>Running</li>
          <li>Swimming</li>
          <li>Cycling</li>
          <li>Dancing</li>
        </ul>
      `
    },
    'mental-health': {
      title: 'Mental Health & Wellbeing',
      description: 'Explore mental health topics, stress management, and emotional wellbeing strategies.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Understanding Mental Health</h2>
        <p>Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act. It also helps determine how we handle stress, relate to others, and make choices. Mental health is important at every stage of life, from childhood and adolescence through adulthood.</p>
        
        <h3>Factors that Contribute to Mental Health</h3>
        <p>Many factors contribute to mental health problems, including:</p>
        <ul>
          <li>Biological factors, such as genes or brain chemistry</li>
          <li>Life experiences, such as trauma or abuse</li>
          <li>Family history of mental health problems</li>
          <li>Lifestyle factors, such as diet, physical activity, and substance use</li>
        </ul>
      `
    }
  };
  
  // Get the current topic data or default to nutrition if not found
  const currentTopic = topicData[topicId as keyof typeof topicData] || topicData.nutrition;

  useEffect(() => {
    const fetchCourseContent = async () => {
      if (!topicId) return;
      
      setLoading(true);
      try {
        // Fetch content for this topic
        const { data: contentData, error: contentError } = await supabase
          .from('course_content')
          .select('*')
          .eq('topic_id', topicId);
          
        if (contentError) throw contentError;
        
        if (contentData) {
          setCourseContent(contentData);
        }
        
        // Fetch user progress if logged in
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('student_progress')
            .select(`
              content_id,
              completed,
              course_content(topic_id)
            `)
            .eq('student_id', user.id)
            .eq('course_content.topic_id', topicId);
            
          if (progressError) throw progressError;
          
          // Calculate progress
          const totalLessons = contentData?.length || 0;
          const completedLessons = progressData?.filter(item => item.completed).length || 0;
          
          setProgress({
            completedLessons,
            totalLessons
          });
        }
        
        // Fetch quizzes related to this topic
        const { data: quizData, error: quizError } = await supabase
          .from('assignments')
          .select('*')
          .ilike('title', `%${topicId}%`);
          
        if (quizError) throw quizError;
        
        if (quizData) {
          // Format quiz data
          const formattedQuizzes = quizData.map(quiz => ({
            id: quiz.id,
            title: quiz.title,
            questions: 10, // This would ideally come from the database
            completed: false // This would be determined by student_assignments
          }));
          
          setQuizzes(formattedQuizzes);
        }
      } catch (error) {
        console.error('Error fetching course content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseContent();
  }, [supabase, topicId, user]);
  
  // Handle content preference change
  const handlePreferenceChange = (preference: 'video' | 'text') => {
    setContentType(preference);
  };
  
  // Scroll to top when topic changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [topicId]);

  // Filter content based on preference
  const filteredContent = courseContent.filter(item => item.content_type === contentType);
  
  // Calculate progress percentage
  const progressPercentage = progress.totalLessons > 0 
    ? Math.round((progress.completedLessons / progress.totalLessons) * 100) 
    : 0;
  
  // Mark content as completed
  const markContentAsCompleted = async (contentId: string) => {
    if (!user) return;
    
    try {
      // Check if progress record exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('content_id', contentId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('student_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('student_id', user.id)
          .eq('content_id', contentId);
          
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('student_progress')
          .insert({
            student_id: user.id,
            content_id: contentId,
            completed: true,
            completed_at: new Date().toISOString(),
            preferred_content_type: contentType
          });
          
        if (insertError) throw insertError;
      }
      
      // Update local progress state
      setProgress(prev => ({
        ...prev,
        completedLessons: prev.completedLessons + 1
      }));
      
      alert('Progress saved!');
    } catch (error) {
      console.error('Error marking content as completed:', error);
      alert('Failed to save progress. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/learn" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <ArrowLeft size={16} className="mr-1" />
            Back to Topics
          </Link>
        </div>
        
        {/* Topic Header */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <img 
              src={currentTopic.image} 
              alt={currentTopic.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-900/70"></div>
          </div>
          
          <div className="relative px-8 py-16 md:py-24 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{currentTopic.title}</h1>
            <p className="text-xl max-w-3xl">{currentTopic.description}</p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
                <BookOpen size={20} className="mr-2" />
                <span>{courseContent.length} Lessons</span>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
                <Clock size={20} className="mr-2" />
                <span>~{courseContent.length * 15} Minutes</span>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
                <Award size={20} className="mr-2" />
                <span>{quizzes.length} Quizzes</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
            <span className="text-indigo-600 font-medium">{progressPercentage}% Complete</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {progress.completedLessons} of {progress.totalLessons} lessons completed
          </div>
        </div>

        {/* Content Preference for Students */}
        {user && user.user_metadata?.role === 'student' && (
          <ContentPreference 
            topicId={topicId || 'nutrition'} 
            onPreferenceChange={handlePreferenceChange} 
          />
        )}
        
        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'overview' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'content' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Content
              </button>
              
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'quizzes' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Quizzes
              </button>
              
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'resources' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Resources
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this Topic</h2>
                <p className="text-gray-600 mb-6">{currentTopic.description}</p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-3">What You'll Learn</h3>
                <ul className="space-y-2 mb-6">
                  {courseContent.slice(0, 5).map((content) => (
                    <li key={content.id} className="flex items-start">
                      <CheckCircle size={20} className="text-green-500 mr-2 mt-0.5" />
                      <span>{content.title}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => setActiveTab('content')}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Start Learning
                </button>
              </div>
            )}
            
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Lessons</h2>
                  <div className="space-y-4">
                    {courseContent.map((content, index) => (
                      <div 
                        key={content.id} 
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <span className="font-medium text-indigo-600">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{content.title}</h3>
                              <p className="text-sm text-gray-500">
                                {content.content_type === 'video' ? 'Video' : 'Text'} • ~15 min
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <button 
                              onClick={() => markContentAsCompleted(content.id)}
                              className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              <Play size={16} className="mr-1" />
                              Mark Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Display content based on preference */}
                {contentType === 'video' && filteredContent.length > 0 ? (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Video Lessons</h3>
                    <div className="space-y-6">
                      {filteredContent.map((content, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{content.title}</h4>
                          <div className="aspect-w-16 aspect-h-9">
                            <iframe 
                              src={content.content.includes('youtube') ? content.content.replace('watch?v=', 'embed/') : content.content} 
                              title={content.title}
                              className="w-full h-96 rounded-lg"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : contentType === 'text' && filteredContent.length > 0 ? (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Text Lessons</h3>
                    <div className="space-y-6">
                      {filteredContent.map((content, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                          <h4 className="text-xl font-medium text-gray-900 mb-4">{content.title}</h4>
                          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.content }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentTopic.content }} />
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Previous Lesson
                  </button>
                  
                  <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex items-center">
                    Next Lesson
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Topic Quizzes</h2>
                <p className="text-gray-600 mb-6">Test your knowledge with these quizzes to reinforce your learning.</p>
                
                <div className="space-y-4">
                  {quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                      <div key={quiz.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">{quiz.title}</h3>
                            <p className="text-sm text-gray-500">{quiz.questions} questions</p>
                            
                            {quiz.completed && (
                              <div className="mt-2 flex items-center">
                                <Award size={16} className="text-yellow-500 mr-1" />
                                <span className="text-sm font-medium">Score: {quiz.score}%</span>
                              </div>
                            )}
                          </div>
                          
                          <Link 
                            to={`/quiz/${quiz.id}`}
                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            {quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                      <Award size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No quizzes available for this topic yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Resources</h2>
                <p className="text-gray-600 mb-6">Download these resources to supplement your learning.</p>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Topic Guide PDF</h3>
                        <p className="text-sm text-gray-500">PDF • 2.4 MB</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-500 hover:text-indigo-600">
                        <Share2 size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-indigo-600">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Additional Resources Website</h3>
                        <p className="text-sm text-gray-500">External Link</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-500 hover:text-indigo-600">
                        <Share2 size={18} />
                      </button>
                      <a 
                        href="https://example.com/resources" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-indigo-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningContent;