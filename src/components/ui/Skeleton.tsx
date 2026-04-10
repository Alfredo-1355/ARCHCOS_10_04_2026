import React from 'react';

export const SkeletonBox = ({ className = '' }: { className?: string }) => {
    return (
        <div className={`animate-pulse bg-arch-border/30 backdrop-blur-md rounded-xl overflow-hidden ${className}`} />
    );
};

export const SkeletonText = ({ className = '' }: { className?: string }) => {
    return (
        <div className={`animate-pulse bg-arch-border/30 rounded-full h-3 ${className}`} />
    );
};

export const ProjectCardSkeleton = () => {
    return (
        <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between border-b border-arch-border/30 bg-white/20">
            <div className="flex-1 flex gap-6 w-full">
                <SkeletonBox className="hidden sm:block w-20 h-20 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-4 py-1">
                    <div className="flex items-center gap-3">
                        <SkeletonText className="w-1/3 h-6" />
                        <SkeletonText className="w-16 h-3" />
                    </div>
                    <SkeletonText className="w-3/4 h-3" />
                    <SkeletonText className="w-1/2 h-3" />
                    <div className="flex gap-3 pt-2">
                        <SkeletonBox className="w-32 h-10 rounded-lg" />
                        <SkeletonBox className="w-24 h-10 rounded-lg" />
                    </div>
                </div>
            </div>
            <div className="w-full xl:w-auto flex items-center justify-between xl:justify-end gap-10 mt-4 xl:mt-0">
                <div className="space-y-2">
                    <SkeletonText className="w-16 h-2" />
                    <SkeletonText className="w-20 h-4" />
                </div>
                <SkeletonBox className="w-24 h-6 rounded-full bg-arch-sand/50" />
            </div>
        </div>
    );
};
