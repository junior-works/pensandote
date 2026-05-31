-- =====================================================================
-- 0015 — RLS de public.users para co-miembros del mismo círculo
-- ---------------------------------------------------------------------
-- Hasta ahora users solo permitía a cada usuario ver/editar su propia
-- fila (users_select_self / users_update_self). Eso impedía que la
-- familia editara nombre/teléfono del adulto mayor (o de otros) desde
-- el modal Miembros, y dejaba sin teléfono al botón "Mandar mensaje 💬".
--
-- Estas policies son ADITIVAS: PostgreSQL evalúa policies con OR, así
-- que las viejas _self se mantienen y siguen valiendo para uno mismo.
-- =====================================================================

-- SELECT: cualquier co-miembro de un círculo compartido puede ver el
-- row de users del otro (para mostrar nombre/teléfono en la lista).
CREATE POLICY users_select_comembros ON public.users FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.circle_members cm_self
  JOIN public.circle_members cm_other ON cm_self.circle_id = cm_other.circle_id
  WHERE cm_self.user_id = auth.uid()
    AND cm_other.user_id = users.id
));

-- UPDATE: admin/editor de un círculo puede editar el row de users de
-- cualquier co-miembro de ese círculo.
CREATE POLICY users_update_admin ON public.users FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.circle_members cm_self
  JOIN public.circle_members cm_other ON cm_self.circle_id = cm_other.circle_id
  WHERE cm_self.user_id = auth.uid()
    AND cm_self.permission_level IN ('admin','editor')
    AND cm_other.user_id = users.id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.circle_members cm_self
  JOIN public.circle_members cm_other ON cm_self.circle_id = cm_other.circle_id
  WHERE cm_self.user_id = auth.uid()
    AND cm_self.permission_level IN ('admin','editor')
    AND cm_other.user_id = users.id
));
