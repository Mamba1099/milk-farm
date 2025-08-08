"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

interface AlertDialogActionProps {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

interface AlertDialogCancelProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

export function AlertDialogContent({ children }: AlertDialogContentProps) {
  return <DialogContent className="max-w-md">{children}</DialogContent>;
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <DialogHeader>{children}</DialogHeader>;
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <DialogTitle>{children}</DialogTitle>;
}

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <div className="text-sm text-muted-foreground">{children}</div>;
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>;
}

export function AlertDialogAction({ onClick, className, disabled, children }: AlertDialogActionProps) {
  return (
    <Button onClick={onClick} className={className} disabled={disabled}>
      {children}
    </Button>
  );
}

export function AlertDialogCancel({ onClick, children }: AlertDialogCancelProps) {
  return (
    <Button variant="outline" onClick={onClick}>
      {children}
    </Button>
  );
}
