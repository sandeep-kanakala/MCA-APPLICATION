import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

function formatName(segment: string) {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function isIdSegment(segment: string) {
  return /^[a-zA-Z0-9_-]{20,}$/.test(segment);
}

function singularize(word: string) {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}

const NON_LINKABLE_SEGMENTS = new Set(['pricebookentries', 'entry', 'edit', 'items']);

const DynamicBreadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = '/' + pathSegments.slice(0, index + 1).join('/');
    return { name: formatName(segment), url, segment };
  });

  if (breadcrumbs.length > 1) {
    const last = breadcrumbs[breadcrumbs.length - 1];
    const prev = breadcrumbs[breadcrumbs.length - 2];
    if (isIdSegment(last.segment)) {
      const singular = singularize(prev.segment.toLowerCase());
      last.name = `${formatName(singular)} Details`;
    }
  }

  const filtered = breadcrumbs.filter((crumb) => crumb.segment.toLowerCase() !== 'sales');

  return (
    <div className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList className="flex flex-wrap gap-1 text-sm">
          {filtered.map((crumb, index) => {
            const isLast = index === filtered.length - 1;
            const isNonLinkable = NON_LINKABLE_SEGMENTS.has(crumb.segment);
            const isRealPage = !isLast && !isNonLinkable;

            return (
              <BreadcrumbItem key={crumb.url} className="flex items-center">
                {isRealPage ? (
                  <>
                    <BreadcrumbLink asChild>
                      <Link
                        to={crumb.url}
                        className="font-medium text-gray-600 hover:text-black transition-colors"
                      >
                        {crumb.name}
                      </Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                ) : !isLast ? (
                  <>
                    <BreadcrumbLink asChild>
                      <span
                        onClick={() => navigate(-1)}
                        className="font-medium text-gray-600 hover:text-black transition-colors cursor-pointer select-none"
                      >
                        {crumb.name}
                      </span>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                ) : (
                  <>
                    <BreadcrumbPage className="font-semibold text-black">
                      {crumb.name}
                    </BreadcrumbPage>
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default DynamicBreadcrumb;
