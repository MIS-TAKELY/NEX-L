import { Icon } from '@iconify/react';
import React, { useState } from 'react';

const SectionList = ({ sections, onSelectContent, activeResourceId }) => {
    const [expandedSections, setExpandedSections] = useState({});
    const [expandedLessons, setExpandedLessons] = useState({});

    const toggleSection = (sectionId) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const toggleLesson = (lessonId) => {
        setExpandedLessons((prev) => ({
            ...prev,
            [lessonId]: !prev[lessonId],
        }));
    };

    return (
        <div className="space-y-4">
            {sections?.map((section, sIndex) => (
                <div key={section._id} className="border-b border-border dark:border-border pb-4">
                    <button
                        onClick={() => toggleSection(section._id)}
                        className="w-full flex items-center justify-between text-left p-2 hover:bg-muted dark:hover:bg-zinc-800/50 rounded-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary text-sm font-bold">
                                {sIndex + 1}
                            </span>
                            <span className="font-bold text-foreground dark:text-foreground line-clamp-1">{section.title}</span>
                        </div>
                        <Icon
                            icon={expandedSections[section._id] ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                            className="text-muted-foreground"
                        />
                    </button>

                    {expandedSections[section._id] && (
                        <div className="mt-2 ml-4 space-y-2 border-l-2 border-gray-50 dark:border-border/50 pl-4">
                            {section.contents?.map((lesson) => (
                                <div key={lesson._id} className="space-y-1">
                                    <button
                                        onClick={() => {
                                            if (lesson.resources?.length > 1 || lesson.type === 'mixed') {
                                                toggleLesson(lesson._id);
                                            } else if (lesson.resources?.[0]) {
                                                onSelectContent(lesson.resources[0], lesson);
                                            } else if (lesson.url) {
                                                onSelectContent({ url: lesson.url, type: lesson.type, name: lesson.title }, lesson);
                                            } else {
                                                onSelectContent({ type: lesson.type, name: lesson.title, _id: lesson._id }, lesson);
                                            }
                                        }}
                                        className={`w-full flex items-center justify-between gap-3 p-2 rounded-md text-sm transition-all ${(activeResourceId === lesson._id || lesson.resources?.some(r => r._id === activeResourceId || r.url === activeResourceId))
                                                ? 'bg-primary/5 text-primary font-bold'
                                                : 'text-foreground dark:text-zinc-300 hover:bg-muted dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Icon
                                                icon={
                                                    lesson.type === 'video'
                                                        ? 'solar:play-bold'
                                                        : lesson.type === 'quiz'
                                                            ? 'solar:checklist-bold'
                                                            : 'solar:document-text-bold'
                                                }
                                                className={(activeResourceId === lesson._id || lesson.resources?.some(r => r._id === activeResourceId || r.url === activeResourceId)) ? 'text-primary' : 'text-muted-foreground'}
                                            />
                                            <span className="truncate">{lesson.title}</span>
                                        </div>
                                        {(lesson.resources?.length > 1 || lesson.type === 'mixed') && (
                                            <Icon
                                                icon={expandedLessons[lesson._id] ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                                                size={14}
                                                className="text-muted-foreground"
                                            />
                                        )}
                                    </button>

                                    {/* Sub-resources (Subsections) */}
                                    {(expandedLessons[lesson._id]) && (
                                        <div className="ml-6 space-y-1 mt-1">
                                            {lesson.resources?.map((resource, rIdx) => (
                                                <button
                                                    key={resource._id || `${lesson._id}-res-${rIdx}`}
                                                    onClick={() => onSelectContent(resource, lesson)}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-md text-xs transition-all ${activeResourceId === resource._id || activeResourceId === resource.url
                                                            ? 'bg-primary/10 text-primary font-bold'
                                                            : 'text-muted-foreground hover:text-foreground dark:hover:text-zinc-400'
                                                        }`}
                                                >
                                                    <Icon
                                                        icon={
                                                            resource.type === 'video'
                                                                ? 'solar:play-circle-bold'
                                                                : 'solar:file-bold'
                                                        }
                                                        className={activeResourceId === resource._id || activeResourceId === resource.url ? 'text-primary' : 'text-muted-foreground'}
                                                    />
                                                    <span className="truncate">{resource.name || lesson.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SectionList;
