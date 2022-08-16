#include <stdio.h>

typedef union play play;
typedef struct state state;
struct state
{
  int c; /* data */
};

union play
{
  /* data */
  play *next;
  state *s;
} u;

play *
list(state **outp)
{
  play *l;

  l = (play *)outp;
  l->next = NULL;
  return l;
}

int main()
{
  struct
  {
    int a;
    int b;
  } p[100];

  return 1;
}