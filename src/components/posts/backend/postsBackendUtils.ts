export function postVisibilityFilter(userId: string) {
  return {
    workspace: {
      users: {
        some: {
          userId,
        },
      },
    },
  }
}

// TODO: Should shared posts be editable? Should we do a delete filter?
export function postEditionFilter(userId: string) {
  return {
    workspace: {
      users: {
        some: {
          userId,
        },
      },
    },
  }
}
