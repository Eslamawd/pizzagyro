"use client";
import React, { useState, useEffect, use } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/Input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  User as UserIcon,
  Mail,
  AlertTriangle,
  Wallet,
  Plus,
  Minus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { changeRole, deleteUser, loadAllUsers } from "../../lib/adminApi";
import Pagination from "../layout/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { depositBalance } from "@/lib/walletApi";
import { Label } from "../ui/Label";
import { useLanguage } from "@/context/LanguageContext";

import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const { lang } = useLanguage();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [balanceAction, setBalanceAction] = useState("deposit");

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { formatPrice } = useCurrency();

  const fetchUsers = async () => {
    try {
      const response = await loadAllUsers(currentPage);
      setUsers(response?.users || []);
      setFilteredUsers(response?.users || []);
      setCurrentPage(response.current_page);
      setLastPage(response.last_page);
      setTotal(response.total);
      if (response.users.length === 0) {
        toast.info("لا يوجد مستخدمين");
      }
    } catch (error) {
      console.error("فشل في جلب المستخدمين", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // البحث
  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        users.filter(
          (user) =>
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  // حذف مستخدم
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      const updatedUsers = users.filter((u) => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setShowDeleteDialog(false);
      toast.success(`تم حذف المستخدم ${userToDelete.email} بنجاح`);
      setUserToDelete(null);
    } catch (error) {
      console.error("فشل حذف المستخدم", error);
      toast.error("فشل حذف المستخدم");
    }
  };

  // تغيير دور المستخدم
  const toggleUserRole = async (userId, newRole) => {
    try {
      const response = await changeRole(userId, { role: newRole });

      const updatedUser = response.user;
      const updatedUsers = users.map((u) =>
        u.id === userId ? updatedUser : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      toast.success(`تم تغيير الدور إلى ${newRole}`);
    } catch (error) {
      console.error("فشل تغيير الدور", error);
      toast.error("فشل تغيير الدور");
    }
  };

  const handleBalanceUpdate = async () => {
    if (!selectedUser) return;

    if (balanceAmount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    if (balanceAction === "withdraw" && balanceAmount > selectedUser.balance) {
      toast.error("Cannot remove more than the current balance");
      return;
    }

    try {
      const response = await depositBalance(
        selectedUser.id,
        { amount: balanceAmount },
        balanceAction
      );

      const updatedUser = response.user;
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      toast.success(`Balance updated for ${selectedUser.email}`);
      setShowBalanceDialog(false);
      setSelectedUser(null);
      setBalanceAmount(0);
    } catch (error) {
      console.error("Failed to update balance", error);
      toast.error("Failed to update balance");
    }
  };

  // Open Balance Dialog
  const openBalanceDialog = (user, action) => {
    setSelectedUser(user);
    setBalanceAction(action);
    setBalanceAmount(0);
    setShowBalanceDialog(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  return (
    <motion.div
      dir={lang === "ar" ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className=" "
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">
            {lang === "ar" ? "إدارة المستخدمين" : "User Management"}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                lang === "ar"
                  ? "ابحث عن مستخدم بالبريد أو الاسم"
                  : "Search user by email or name"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredUsers?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">
                {lang === "ar" ? "لا يوجد مستخدمين" : "No users found"}
              </p>
              <p className="text-sm">
                {searchQuery
                  ? lang === "ar"
                    ? "حاول تعديل نص البحث"
                    : "Try adjusting your search"
                  : lang === "ar"
                  ? "لم يتم تسجيل أي مستخدم بعد"
                  : "No users have been registered yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {lang === "ar"
                        ? "المستخدم & البريد الإلكتروني"
                        : "User & Email"}
                    </TableHead>
                    <TableHead>{lang === "ar" ? "الهاتف" : "Phone"}</TableHead>
                    <TableHead>
                      {lang === "ar" ? "الرصيد" : "Balance"}
                    </TableHead>
                    <TableHead>{lang === "ar" ? "الدور" : "Role"}</TableHead>
                    <TableHead className="text-right">
                      {lang === "ar" ? "الإجراءات" : "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium flex items-center gap-1">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        {user.name}
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </TableCell>
                      <TableCell>{user?.phone}</TableCell>

                      <TableCell className="flex items-center gap-1">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatPrice(user?.balance) || 0.0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {user.role === "admin"
                            ? lang === "ar"
                              ? "مسؤول"
                              : "Admin"
                            : lang === "ar"
                            ? "مستخدم"
                            : "User"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-3">
                          <Button
                            onClick={() => openBalanceDialog(user, "deposit")}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {lang === "ar" ? "إيداع" : "Deposit"}
                          </Button>
                          <Button
                            onClick={() => openBalanceDialog(user, "withdraw")}
                            disabled={user.balance <= 0}
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            {lang === "ar" ? "سحب" : "Withdraw"}
                          </Button>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(val) =>
                              toggleUserRole(user.id, val)
                            }
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="user">
                                {lang === "ar" ? "مستخدم" : "User"}
                              </SelectItem>
                              <SelectItem value="admin">
                                {lang === "ar" ? "مسؤول" : "Admin"}
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {lang === "ar" ? "حذف" : "Delete"}
                          </Button>
                          <Link href={`/admin/customers/${user.id}`}>
                            <Button>Show</Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          label={lang === "ar" ? "المستخدمين" : "Users"}
          onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
        />
      </Card>

      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === "ar"
                ? `هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حساب المستخدم ${
                    userToDelete ? `(${userToDelete.email})` : ""
                  } وكل البيانات المرتبطة به بشكل دائم.`
                : `This action cannot be undone. The user ${
                    userToDelete ? `(${userToDelete.email})` : ""
                  } and all related data will be permanently deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-300 text-destructive-foreground"
            >
              {lang === "ar" ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* نافذة إدارة الرصيد */}
      <motion.div dir={lang === "ar" ? "rtl" : "ltr"}>
        <Dialog open={showBalanceDialog} onOpenChange={setShowBalanceDialog}>
          <DialogContent className="bg-black  max-w-md">
            <DialogHeader>
              <DialogTitle>
                <motion.div dir={lang === "ar" ? "rtl" : "ltr"}>
                  {balanceAction === "deposit"
                    ? lang === "ar"
                      ? "إيداع"
                      : "Deposit"
                    : lang === "ar"
                    ? "سحب"
                    : "Withdraw"}
                </motion.div>
              </DialogTitle>
              <DialogDescription>
                {balanceAction === "deposit"
                  ? lang === "ar"
                    ? "إضافة أموال إلى رصيد المستخدم"
                    : "Add funds to the user's account balance"
                  : lang === "ar"
                  ? "إزالة أموال من رصيد المستخدم"
                  : "Remove funds from the user's account balance"}
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {lang === "ar" ? "الرصيد الحالي:" : "Current Balance:"}
                  </div>
                  <div className="font-medium">
                    {formatPrice(selectedUser.balance) || 0.0}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {lang === "ar" ? "المبلغ " : "Amount "}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={balanceAmount || ""}
                    onChange={(e) =>
                      setBalanceAmount(parseFloat(e.target.value) || 0)
                    }
                    placeholder={lang === "ar" ? "أدخل المبلغ" : "Enter amount"}
                  />

                  {balanceAction === "withdraw" &&
                    balanceAmount > selectedUser.balance && (
                      <p className="text-sm text-red-500">
                        {lang === "ar"
                          ? `لا يمكن سحب أكثر من الرصيد الحالي (${
                              selectedUser.balance || 0.0
                            })`
                          : `Cannot withdraw more than the current balance (${
                              selectedUser.balance || 0.0
                            })`}
                      </p>
                    )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBalanceDialog(false)}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={handleBalanceUpdate}
                disabled={
                  !balanceAmount ||
                  balanceAmount <= 0 ||
                  (balanceAction === "withdraw" &&
                    selectedUser &&
                    balanceAmount > selectedUser.balance)
                }
              >
                {balanceAction === "deposit"
                  ? lang === "ar"
                    ? "إضافة رصيد"
                    : "Add Funds"
                  : lang === "ar"
                  ? "سحب رصيد"
                  : "Remove Funds"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </motion.div>
  );
};

export default UserManagement;
