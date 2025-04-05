// Mock data utility for development and testing

import { v4 as uuidv4 } from 'uuid';

// Mock parent data
export const mockParents = [
  {
    id: uuidv4(),
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    role: 'parent',
    children_count: 2,
    status: 'active',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  },
  {
    id: uuidv4(),
    first_name: 'Maria',
    last_name: 'Garcia',
    email: 'maria.garcia@example.com',
    role: 'parent',
    children_count: 1,
    status: 'active',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  },
  {
    id: uuidv4(),
    first_name: 'Robert',
    last_name: 'Johnson',
    email: 'robert.johnson@example.com',
    role: 'parent',
    children_count: 3,
    status: 'active',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
  }
];

// Generate mock children data based on mock parents
export const generateMockChildren = () => {
  const children = [];
  
  // Children for John Smith
  children.push({
    id: uuidv4(),
    parent_id: mockParents[0].id,
    first_name: 'Emma',
    last_name: 'Smith',
    date_of_birth: '2018-05-15',
    age_group: '4-5',
    allergies: 'Peanuts',
    special_notes: 'Loves drawing',
    created_at: mockParents[0].created_at,
  });
  
  children.push({
    id: uuidv4(),
    parent_id: mockParents[0].id,
    first_name: 'Noah',
    last_name: 'Smith',
    date_of_birth: '2019-03-22',
    age_group: '3-4',
    allergies: '',
    special_notes: 'Shy with new people',
    created_at: mockParents[0].created_at,
  });
  
  // Child for Maria Garcia
  children.push({
    id: uuidv4(),
    parent_id: mockParents[1].id,
    first_name: 'Sophia',
    last_name: 'Garcia',
    date_of_birth: '2017-11-10',
    age_group: '5-6',
    allergies: 'Dairy',
    special_notes: 'Excellent at puzzles',
    created_at: mockParents[1].created_at,
  });
  
  // Children for Robert Johnson
  children.push({
    id: uuidv4(),
    parent_id: mockParents[2].id,
    first_name: 'William',
    last_name: 'Johnson',
    date_of_birth: '2018-08-05',
    age_group: '4-5',
    allergies: 'None',
    special_notes: 'Loves music',
    created_at: mockParents[2].created_at,
  });
  
  children.push({
    id: uuidv4(),
    parent_id: mockParents[2].id,
    first_name: 'Olivia',
    last_name: 'Johnson',
    date_of_birth: '2019-01-15',
    age_group: '3-4',
    allergies: 'Eggs',
    special_notes: 'Very active',
    created_at: mockParents[2].created_at,
  });
  
  children.push({
    id: uuidv4(),
    parent_id: mockParents[2].id,
    first_name: 'James',
    last_name: 'Johnson',
    date_of_birth: '2020-06-22',
    age_group: '2-3',
    allergies: 'None',
    special_notes: 'Loves stories',
    created_at: mockParents[2].created_at,
  });
  
  return children;
};

// Mock children data
export const mockChildren = generateMockChildren();

// Function to get mock children by parent ID
export const getMockChildrenByParentId = (parentId: string) => {
  return mockChildren.filter(child => child.parent_id === parentId);
};

// Function to get all mock children
export const getAllMockChildren = () => {
  return mockChildren;
};

// Function to get all mock parents
export const getAllMockParents = () => {
  return mockParents;
};

// Function to get a mock parent by ID
export const getMockParentById = (parentId: string) => {
  return mockParents.find(parent => parent.id === parentId);
};

// Function to get a mock child by ID
export const getMockChildById = (childId: string) => {
  return mockChildren.find(child => child.id === childId);
};
