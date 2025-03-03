import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Brain, Activity, Award } from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl mb-8">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/signup"
                  className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg shadow-md hover:bg-gray-100 transition duration-300 text-center"
                >
                  {t('home.cta.signup')}
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-indigo-600 transition duration-300 text-center"
                >
                  {t('home.cta.start')}
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="Students learning" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <BookOpen size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">
                {t('home.features.quizzes.title')}
              </h3>
              <p className="text-gray-600 text-center">
                {t('home.features.quizzes.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Brain size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">
                {t('home.features.ai.title')}
              </h3>
              <p className="text-gray-600 text-center">
                {t('home.features.ai.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Activity size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">
                {t('home.features.tracking.title')}
              </h3>
              <p className="text-gray-600 text-center">
                {t('home.features.tracking.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.testimonials.title')}
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
              </div>
              <p className="text-gray-600 italic mb-6 text-center">
                "{t('home.testimonials.1.quote')}"
              </p>
              <p className="text-gray-800 font-medium text-center">
                {t('home.testimonials.1.author')}
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
              </div>
              <p className="text-gray-600 italic mb-6 text-center">
                "{t('home.testimonials.2.quote')}"
              </p>
              <p className="text-gray-800 font-medium text-center">
                {t('home.testimonials.2.author')}
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
                <Award size={24} className="text-yellow-500" />
              </div>
              <p className="text-gray-600 italic mb-6 text-center">
                "{t('home.testimonials.3.quote')}"
              </p>
              <p className="text-gray-800 font-medium text-center">
                {t('home.testimonials.3.author')}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to make health education fun?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of students, teachers, and parents who are transforming how we learn about health and wellness.
          </p>
          <Link
            to="/signup"
            className="px-8 py-4 bg-white text-indigo-600 font-medium rounded-lg shadow-md hover:bg-gray-100 transition duration-300 inline-block"
          >
            {t('home.cta.signup')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;