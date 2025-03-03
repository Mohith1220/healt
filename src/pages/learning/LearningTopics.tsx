import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, Activity, Heart, Shield, Apple } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LearningTopics: React.FC = () => {
  const { supabase } = useAuth();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredContent, setFeaturedContent] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        
        // Get unique topic IDs from course_content
        const { data: topicData, error: topicError } = await supabase
          .from('course_content')
          .select('topic_id')
          .order('topic_id')
          .limit(10);
          
        if (topicError) throw topicError;
        
        // Get unique topic IDs
        const uniqueTopicIds = Array.from(new Set(topicData?.map(item => item.topic_id)));
        
        // Get content count for each topic
        const topicsWithCounts = await Promise.all(
          uniqueTopicIds.map(async (topicId) => {
            const { data: contentData, error: contentError } = await supabase
              .from('course_content')
              .select('id, content_type')
              .eq('topic_id', topicId);
              
            if (contentError) throw contentError;
            
            // Get quiz count for this topic
            const { data: quizData, error: quizError } = await supabase
              .from('assignments')
              .select('id')
              .ilike('title', `%${topicId}%`);
              
            if (quizError) throw quizError;
            
            return {
              id: topicId,
              title: formatTopicName(topicId),
              description: getTopicDescription(topicId),
              icon: getTopicIcon(topicId),
              color: getTopicColor(topicId),
              borderColor: getTopicBorderColor(topicId),
              lessons: contentData?.length || 0,
              quizzes: quizData?.length || 0,
              level: getTopicLevel(topicId)
            };
          })
        );
        
        setTopics(topicsWithCounts);
        
        // Get featured content (most recent content)
        const { data: recentContent, error: recentError } = await supabase
          .from('course_content')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2);
          
        if (recentError) throw recentError;
        
        setFeaturedContent(recentContent || []);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopics();
  }, [supabase]);

  // Helper functions for topic formatting
  const formatTopicName = (topicId: string): string => {
    const topicNames: Record<string, string> = {
      'nutrition': 'Nutrition & Healthy Eating',
      'physical-activity': 'Physical Activity & Fitness',
      'mental-health': 'Mental Health & Wellbeing',
      'personal-hygiene': 'Personal Hygiene',
      'first-aid': 'First Aid & Safety',
      'health-literacy': 'Health Literacy'
    };
    
    return topicNames[topicId] || topicId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  const getTopicDescription = (topicId: string): string => {
    const descriptions: Record<string, string> = {
      'nutrition': 'Learn about balanced diets, nutrients, and making healthy food choices.',
      'physical-activity': 'Discover the importance of exercise, different types of physical activities, and fitness tips.',
      'mental-health': 'Explore mental health topics, stress management, and emotional wellbeing strategies.',
      'personal-hygiene': 'Learn about proper hygiene practices, disease prevention, and staying healthy.',
      'first-aid': 'Basic first aid knowledge, emergency responses, and safety precautions.',
      'health-literacy': 'Understanding health information, making informed health decisions, and navigating health systems.'
    };
    
    return descriptions[topicId] || 'Explore this health education topic to learn more.';
  };
  
  const getTopicIcon = (topicId: string) => {
    const icons: Record<string, JSX.Element> = {
      'nutrition': <Apple size={32} className="text-green-600" />,
      'physical-activity': <Activity size={32} className="text-blue-600" />,
      'mental-health': <Brain size={32} className="text-purple-600" />,
      'personal-hygiene': <Shield size={32} className="text-indigo-600" />,
      'first-aid': <Heart size={32} className="text-red-600" />,
      'health-literacy': <BookOpen size={32} className="text-yellow-600" />
    };
    
    return icons[topicId] || <BookOpen size={32} className="text-gray-600" />;
  };
  
  const getTopicColor = (topicId: string): string => {
    const colors: Record<string, string> = {
      'nutrition': 'bg-green-100',
      'physical-activity': 'bg-blue-100',
      'mental-health': 'bg-purple-100',
      'personal-hygiene': 'bg-indigo-100',
      'first-aid': 'bg-red-100',
      'health-literacy': 'bg-yellow-100'
    };
    
    return colors[topicId] || 'bg-gray-100';
  };
  
  const getTopicBorderColor = (topicId: string): string => {
    const colors: Record<string, string> = {
      'nutrition': 'border-green-200',
      'physical-activity': 'border-blue-200',
      'mental-health': 'border-purple-200',
      'personal-hygiene': 'border-indigo-200',
      'first-aid': 'border-red-200',
      'health-literacy': 'border-yellow-200'
    };
    
    return colors[topicId] || 'border-gray-200';
  };
  
  const getTopicLevel = (topicId: string): string => {
    const levels: Record<string, string> = {
      'nutrition': 'Beginner to Advanced',
      'physical-activity': 'All Levels',
      'mental-health': 'Beginner to Intermediate',
      'personal-hygiene': 'Beginner',
      'first-aid': 'Beginner to Intermediate',
      'health-literacy': 'Intermediate to Advanced'
    };
    
    return levels[topicId] || 'All Levels';
  };

  // Placeholder for empty state
  const defaultTopics = [
    {
      id: 'nutrition',
      title: 'Nutrition & Healthy Eating',
      description: 'Learn about balanced diets, nutrients, and making healthy food choices.',
      icon: <Apple size={32} className="text-green-600" />,
      color: 'bg-green-100',
      borderColor: 'border-green-200',
      lessons: 12,
      quizzes: 5,
      level: 'Beginner to Advanced'
    },
    {
      id: 'physical-activity',
      title: 'Physical Activity & Fitness',
      description: 'Discover the importance of exercise, different types of physical activities, and fitness tips.',
      icon: <Activity size={32} className="text-blue-600" />,
      color: 'bg-blue-100',
      borderColor: 'border-blue-200',
      lessons: 10,
      quizzes: 4,
      level: 'All Levels'
    },
    {
      id: 'mental-health',
      title: 'Mental Health & Wellbeing',
      description: 'Explore mental health topics, stress management, and emotional wellbeing strategies.',
      icon: <Brain size={32} className="text-purple-600" />,
      color: 'bg-purple-100',
      borderColor: 'border-purple-200',
      lessons: 8,
      quizzes: 3,
      level: 'Beginner to Intermediate'
    }
  ];

  const displayTopics = topics.length > 0 ? topics : defaultTopics;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="bg-indigo-600 text-white rounded-lg shadow-md mb-12 overflow-hidden">
          <div className="p-8 md:p-12">
            <h1 className="text-3xl font-bold mb-4">Health Education Topics</h1>
            <p className="text-xl max-w-3xl">
              Explore our comprehensive health education topics designed to help you learn about various aspects of health and wellness.
            </p>
          </div>
        </section>

        {/* Topics Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm h-64"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTopics.map((topic) => (
              <Link 
                key={topic.id} 
                to={`/learn/${topic.id}`}
                className={`block ${topic.color} border ${topic.borderColor} rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      {topic.icon}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{topic.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {topic.description}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{topic.lessons} Lessons</span>
                    <span>{topic.quizzes} Quizzes</span>
                    <span>{topic.level}</span>
                  </div>
                </div>
                <div className="bg-white p-4 border-t border-gray-200">
                  <span className="text-indigo-600 font-medium">Explore Topic →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Featured Content */}
        <section className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Health Content</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredContent.length > 0 ? (
              featuredContent.map((content) => (
                <div key={content.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h3>
                    <p className="text-gray-600 mb-4">
                      {content.content_type === 'text' 
                        ? content.content.substring(0, 150) + '...' 
                        : 'Video content about ' + formatTopicName(content.topic_id)}
                    </p>
                    <Link to={`/learn/${content.topic_id}`} className="text-indigo-600 font-medium">
                      Read More →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">The Importance of Balanced Nutrition</h3>
                    <p className="text-gray-600 mb-4">
                      Learn how a balanced diet contributes to overall health and wellbeing, and discover practical tips for healthy eating.
                    </p>
                    <Link to="/learn/nutrition" className="text-indigo-600 font-medium">
                      Read Article →
                    </Link>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Managing Stress in Daily Life</h3>
                    <p className="text-gray-600 mb-4">
                      Explore effective strategies for managing stress, building resilience, and maintaining good mental health.
                    </p>
                    <Link to="/learn/mental-health" className="text-indigo-600 font-medium">
                      Read Article →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Learning Paths */}
        <section className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Recommended Learning Paths</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">For Beginners</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span>Personal Hygiene Basics</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span>Introduction to Nutrition</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span>Physical Activity Fundamentals</span>
                </li>
              </ul>
              <Link to="/learn/personal-hygiene" className="mt-4 px-4 py-2 bg-white text-indigo-600 rounded-md font-medium inline-block">
                Start Path
              </Link>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">For Intermediates</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span>Advanced Nutrition Concepts</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span>Mental Health Strategies</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span>First Aid Essentials</span>
                </li>
              </ul>
              <Link to="/learn/nutrition" className="mt-4 px-4 py-2 bg-white text-indigo-600 rounded-md font-medium inline-block">
                Start Path
              </Link>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">For Advanced</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span>Health Literacy & Advocacy</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span>Specialized Nutrition Topics</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  <span>Mental Health Deep Dive</span>
                </li>
              </ul>
              <Link to="/learn/health-literacy" className="mt-4 px-4 py-2 bg-white text-indigo-600 rounded-md font-medium inline-block">
                Start Path
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LearningTopics;