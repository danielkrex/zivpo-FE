import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import InvitationView from '../views/InvitationView.vue'
import AdminView from '../views/AdminView.vue'
import ProjectView from '../views/ProjectView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import LoginView from '../views/LoginView.vue'
import SuperuserView from '../views/SuperuserView.vue'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    component: HomeView
  },
  {
    path: '/invite',
    component: InvitationView
  },
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/admin',
    component: AdminView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/projects/:projectId',
    component: ProjectView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/superuser',
    component: SuperuserView,
    meta: { requiresAuth: true, requiresSuperuser: true }
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (to.meta.requiresSuperuser && !authStore.isSuperuser) {
    return '/admin'
  }
})

export default router
